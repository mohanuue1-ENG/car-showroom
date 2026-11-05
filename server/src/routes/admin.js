const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Car = require('../models/Car');
const Category = require('../models/Category');
const Inquiry = require('../models/Inquiry');
const Settings = require('../models/Settings');
const ActivityLog = require('../models/ActivityLog');
const { authRequired, adminRequired } = require('../middleware/auth');
const { upload, publicPath } = require('../middleware/upload');
const { uniqueCategorySlug, removeUpload } = require('../utils/helpers');
const { buildFilter } = require('./cars');

const router = express.Router();
router.use(authRequired, adminRequired);

const { FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, CONDITIONS, CAR_STATUSES } = Car;
const { INQUIRY_STATUSES, TEST_DRIVE_STATUSES } = Inquiry;
const validId = (id) => mongoose.isValidObjectId(id);
const bad = (res, msg) => res.status(400).json({ error: msg });
const notFound = (res, what) => res.status(404).json({ error: `${what} not found` });
const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------- validation for car fields (missing fields fall back to `existing`) ----------
function cleanCar(input, existing) {
  const pick = (k) => (input[k] !== undefined ? input[k] : existing[k]);

  const text = (k, max, required = false) => {
    const v = String(pick(k) ?? '').trim();
    if (required && !v) return { error: `${k} is required` };
    if (v.length > max) return { error: `${k} must be ${max} characters or fewer` };
    return { value: v };
  };
  const num = (k, min, max) => {
    const raw = pick(k);
    const n = raw === '' || raw === null || raw === undefined ? NaN : Number(raw);
    if (!Number.isFinite(n) || n < min || n > max) return { error: `${k} must be a number between ${min} and ${max}` };
    return { value: Math.round(n) };
  };
  const oneOf = (k, list) => (list.includes(pick(k)) ? { value: pick(k) } : { error: `${k} must be one of: ${list.join(', ')}` });

  const vin = String(pick('vin') ?? '').trim().toUpperCase();
  const checks = {
    make: text('make', 60, true),
    model: text('model', 80, true),
    year: num('year', 1950, new Date().getFullYear() + 1),
    price: num('price', 0, 500000000),
    mileage: num('mileage', 0, 2000000),
    fuel: oneOf('fuel', FUEL_TYPES),
    transmission: oneOf('transmission', TRANSMISSIONS),
    bodyType: oneOf('bodyType', BODY_TYPES),
    condition: oneOf('condition', CONDITIONS),
    status: oneOf('status', CAR_STATUSES.filter((s) => s !== 'sold')),
    engine: text('engine', 120),
    exteriorColor: text('exteriorColor', 40),
    interiorColor: text('interiorColor', 40),
    location: text('location', 120),
    description: text('description', 4000),
  };
  if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return { error: 'VIN must be 17 letters or numbers (no I, O or Q)' };
  const failed = Object.values(checks).find((c) => c.error);
  if (failed) return { error: failed.error };

  const car = {};
  for (const [key, check] of Object.entries(checks)) car[key] = check.value;
  car.vin = vin;
  const category = pick('category');
  car.category = category && validId(category) ? category : null;
  car.isFeatured = pick('isFeatured') === true || pick('isFeatured') === 'true';
  return { car };
}

const CAR_DEFAULTS = { status: 'available', fuel: 'Petrol', transmission: 'Automatic', bodyType: 'Sedan', condition: 'used', isFeatured: false };
const COLOR_PALETTE = ['#c0c7d1', '#e9ecef', '#b8332f', '#2f5d8c', '#2b2d30', '#4f8a5b', '#e07a2e', '#5b6b3a', '#1d2b4a', '#aab2bd'];

// ---------- dashboard & notifications ----------
// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  const [totalCars, availableCars, soldCars, totalCustomers, totalInquiries, revenueAgg, activities, newInquiries, pendingTestDrives] =
    await Promise.all([
      Car.countDocuments(),
      Car.countDocuments({ status: 'available' }),
      Car.countDocuments({ status: 'sold' }),
      User.countDocuments({ role: 'customer' }),
      Inquiry.countDocuments({ type: 'inquiry' }),
      Car.aggregate([{ $match: { status: 'sold' } }, { $group: { _id: null, total: { $sum: '$soldPrice' } } }]),
      ActivityLog.find().sort({ createdAt: -1 }).limit(12),
      Inquiry.countDocuments({ type: 'inquiry', status: 'new' }),
      Inquiry.countDocuments({ type: 'test_drive', status: 'requested' }),
    ]);

  res.json({
    totalCars,
    availableCars,
    soldCars,
    totalCustomers,
    totalInquiries,
    totalRevenue: revenueAgg[0]?.total || 0,
    recentActivities: activities,
    newInquiries,
    pendingTestDrives,
  });
});

// GET /api/admin/notifications
router.get('/notifications', async (req, res) => {
  const [newInq, pendingTd, noPhotos] = await Promise.all([
    Inquiry.countDocuments({ type: 'inquiry', status: 'new' }),
    Inquiry.countDocuments({ type: 'test_drive', status: 'requested' }),
    Car.countDocuments({ status: { $ne: 'sold' }, images: { $size: 0 } }),
  ]);
  const items = [];
  if (newInq) items.push({ message: `${newInq} new customer inquiry(ies) to answer`, link: '/admin/inquiries?status=new' });
  if (pendingTd) items.push({ message: `${pendingTd} test drive request(s) awaiting confirmation`, link: '/admin/test-drives?status=requested' });
  if (noPhotos) items.push({ message: `${noPhotos} car(s) have no photos yet`, link: '/admin/cars' });
  res.json({ items, count: items.length });
});

// ---------- cars ----------
// GET /api/admin/cars  (all statuses unless ?status is given)
router.get('/cars', async (req, res) => {
  const filter = await buildFilter(req.query);
  if (!req.query.status) delete filter.status;
  const cars = await Car.find(filter).sort({ createdAt: -1 }).populate('category', 'name slug');
  res.json({ items: cars });
});

// GET /api/admin/cars/:id
router.get('/cars/:id', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Car');
  const car = await Car.findById(req.params.id).populate('category', 'name slug');
  if (!car) return notFound(res, 'Car');
  res.json({ car });
});

// POST /api/admin/cars
router.post('/cars', async (req, res) => {
  const result = cleanCar(req.body || {}, CAR_DEFAULTS);
  if (result.error) return bad(res, result.error);
  const car = await Car.create({
    ...result.car,
    images: [],
    // Fallback colour until photos are added
    description: result.car.description,
  });
  await ActivityLog.log('car', `Added ${car.year} ${car.make} ${car.model} to inventory`);
  res.status(201).json({ car: await car.populate('category', 'name slug') });
});

// PUT /api/admin/cars/:id  (partial updates allowed: price, specs, availability)
router.put('/cars/:id', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Car');
  const car = await Car.findById(req.params.id);
  if (!car) return notFound(res, 'Car');
  if (car.status === 'sold' && req.body.status && req.body.status !== 'sold') {
    return bad(res, 'Sold cars cannot be made available again. Create a new listing instead.');
  }
  const result = cleanCar(req.body || {}, car);
  if (result.error) return bad(res, result.error);
  Object.assign(car, result.car);
  await car.save();
  res.json({ car: await car.populate('category', 'name slug') });
});

// PUT /api/admin/cars/:id/sold  body: { soldPrice }
router.put('/cars/:id/sold', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Car');
  const car = await Car.findById(req.params.id);
  if (!car) return notFound(res, 'Car');
  const soldPrice = Number((req.body || {}).soldPrice ?? car.price);
  if (!Number.isFinite(soldPrice) || soldPrice < 0) return bad(res, 'Enter a valid sale price');
  car.status = 'sold';
  car.soldPrice = soldPrice;
  car.soldAt = new Date();
  await car.save();
  await ActivityLog.log('sale', `Sold ${car.year} ${car.make} ${car.model} for $${soldPrice.toLocaleString('en-US')}`);
  res.json({ car });
});

// DELETE /api/admin/cars/:id
router.delete('/cars/:id', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Car');
  const car = await Car.findByIdAndDelete(req.params.id);
  if (!car) return notFound(res, 'Car');
  await User.updateMany({}, { $pull: { wishlist: car._id, recentlyViewed: car._id } });
  car.images.forEach(removeUpload);
  await ActivityLog.log('car', `Removed ${car.year} ${car.make} ${car.model} from inventory`);
  res.json({ message: 'Car deleted' });
});

// POST /api/admin/cars/:id/images  (multiple photos, field "images")
router.post('/cars/:id/images', upload.array('images', 10), async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Car');
  const car = await Car.findById(req.params.id);
  if (!car) return notFound(res, 'Car');
  if (!req.files || req.files.length === 0) return bad(res, 'Please select at least one photo');
  car.images.push(...req.files.map(publicPath));
  await car.save();
  res.json({ car });
});

// DELETE /api/admin/cars/:id/images  body: { url }
router.delete('/cars/:id/images', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Car');
  const car = await Car.findById(req.params.id);
  if (!car) return notFound(res, 'Car');
  const url = String((req.body || {}).url || '');
  if (!car.images.includes(url)) return notFound(res, 'Photo');
  car.images = car.images.filter((img) => img !== url);
  await car.save();
  removeUpload(url);
  res.json({ car });
});

// ---------- inventory ----------
// GET /api/admin/inventory  (stock-style overview: counts by status and by category)
router.get('/inventory', async (req, res) => {
  const [items, byCategory] = await Promise.all([
    Car.find().sort({ status: 1, createdAt: -1 }).select('make model year price mileage status condition images category views').populate('category', 'name'),
    Car.aggregate([{ $group: { _id: { status: '$status', category: '$category' }, count: { $sum: 1 } } }]),
  ]);
  res.json({ items, summary: byCategory });
});

// ---------- categories ----------
router.get('/categories', async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ items: categories });
});

// POST /api/admin/categories  (multipart: name, description, image)
router.post('/categories', upload.single('image'), async (req, res) => {
  const name = String((req.body || {}).name || '').trim();
  if (!name) return bad(res, 'Category name is required');
  if (await Category.exists({ name: new RegExp(`^${escapeRe(name)}$`, 'i') })) {
    return res.status(409).json({ error: 'A category with this name already exists' });
  }
  const category = await Category.create({
    name,
    slug: await uniqueCategorySlug(name),
    description: String(req.body.description || '').trim(),
    image: req.file ? publicPath(req.file) : '',
  });
  res.status(201).json({ category });
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', upload.single('image'), async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Category');
  const category = await Category.findById(req.params.id);
  if (!category) return notFound(res, 'Category');
  const body = req.body || {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return bad(res, 'Category name is required');
    if (name !== category.name) {
      category.slug = await uniqueCategorySlug(name, category._id);
      category.name = name;
    }
  }
  if (body.description !== undefined) category.description = String(body.description).trim();
  if (req.file) {
    removeUpload(category.image);
    category.image = publicPath(req.file);
  }
  await category.save();
  res.json({ category });
});

// DELETE /api/admin/categories/:id  (refused while cars still use it)
router.delete('/categories/:id', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Category');
  const inUse = await Car.countDocuments({ category: req.params.id });
  if (inUse) return res.status(409).json({ error: `Move or delete the ${inUse} car(s) in this category first` });
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return notFound(res, 'Category');
  removeUpload(category.image);
  res.json({ message: 'Category deleted' });
});

// ---------- inquiries & test drives ----------
// GET /api/admin/inquiries?type=inquiry|test_drive&status=
async function listRequests(type, req, res) {
  const filter = { type };
  const allowed = type === 'inquiry' ? INQUIRY_STATUSES : TEST_DRIVE_STATUSES;
  if (allowed.includes(req.query.status)) filter.status = req.query.status;
  const items = await Inquiry.find(filter).sort({ createdAt: -1 }).limit(300).populate('car', 'make model year images price');
  res.json({ items });
}
router.get('/inquiries', (req, res) => listRequests('inquiry', req, res));
router.get('/test-drives', (req, res) => listRequests('test_drive', req, res));

// GET /api/admin/inquiries/:id
router.get('/inquiries/:id', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Request');
  const request = await Inquiry.findById(req.params.id).populate('car', 'make model year images price status');
  if (!request) return notFound(res, 'Request');
  res.json({ request });
});

// POST /api/admin/inquiries/:id/reply  body: { message }  (replying marks the inquiry as responded)
router.post('/inquiries/:id/reply', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Request');
  const message = String((req.body || {}).message || '').trim();
  if (message.length < 2) return bad(res, 'Write a reply first');
  const request = await Inquiry.findOne({ _id: req.params.id, type: 'inquiry' });
  if (!request) return notFound(res, 'Inquiry');
  request.replies.push({ message });
  request.status = 'responded';
  await request.save();
  res.json({ request });
});

// PUT /api/admin/inquiries/:id/status  body: { status }
router.put('/inquiries/:id/status', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Request');
  const request = await Inquiry.findById(req.params.id);
  if (!request) return notFound(res, 'Request');
  const allowed = request.type === 'inquiry' ? INQUIRY_STATUSES : TEST_DRIVE_STATUSES;
  const status = (req.body || {}).status;
  if (!allowed.includes(status)) return bad(res, `Status must be one of: ${allowed.join(', ')}`);
  request.status = status;
  await request.save();
  if (request.type === 'test_drive') {
    await ActivityLog.log('test_drive', `Test drive for ${request.name} marked ${status}`);
  }
  res.json({ request });
});

// ---------- customers ----------
// GET /api/admin/customers?q=
router.get('/customers', async (req, res) => {
  const filter = { role: 'customer' };
  if (req.query.q) {
    const q = escapeRe(req.query.q);
    filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  }
  const customers = await User.find(filter).sort({ createdAt: -1 }).select('name email phone isActive createdAt');
  const counts = await Inquiry.aggregate([
    { $match: { user: { $ne: null } } },
    { $group: { _id: "$user", requests: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.requests]));
  res.json({ items: customers.map((c) => ({ ...c.toObject(), requestCount: map[String(c._id)] || 0 })) });
});

// GET /api/admin/customers/:id
router.get('/customers/:id', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Customer');
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' }).select('-wishlist -recentlyViewed');
  if (!customer) return notFound(res, 'Customer');
  const [inquiries, testDrives] = await Promise.all([
    Inquiry.find({ user: customer._id, type: 'inquiry' }).sort({ createdAt: -1 }).populate('car', 'make model year'),
    Inquiry.find({ user: customer._id, type: 'test_drive' }).sort({ createdAt: -1 }).populate('car', 'make model year'),
  ]);
  res.json({ customer, inquiries, testDrives });
});

// PUT /api/admin/customers/:id  body: { isActive }
router.put('/customers/:id', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res, 'Customer');
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!customer) return notFound(res, 'Customer');
  if (typeof req.body.isActive === 'boolean') customer.isActive = req.body.isActive;
  await customer.save();
  await ActivityLog.log('customer', `${customer.isActive ? 'Enabled' : 'Disabled'} account for ${customer.name}`);
  res.json({ customer: customer.toPublic() });
});

// ---------- reports ----------
// GET /api/admin/reports/sales?months=12
router.get('/reports/sales', async (req, res) => {
  const months = Math.min(Math.max(parseInt(req.query.months, 10) || 12, 1), 36);
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1), 1);
  since.setHours(0, 0, 0, 0);

  const [monthly, byMake, stock] = await Promise.all([
    Car.aggregate([
      { $match: { status: 'sold', soldAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$soldAt' } }, revenue: { $sum: '$soldPrice' }, cars: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Car.aggregate([
      { $match: { status: 'sold' } },
      { $group: { _id: '$make', revenue: { $sum: '$soldPrice' }, cars: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),
    Car.aggregate([
      { $match: { status: { $ne: 'sold' } } },
      { $group: { _id: null, value: { $sum: '$price' }, count: { $sum: 1 } } },
    ]),
  ]);

  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalCars = monthly.reduce((s, m) => s + m.cars, 0);
  res.json({
    monthly,
    byMake,
    totalRevenue,
    totalCars,
    averageSale: totalCars ? totalRevenue / totalCars : 0,
    inventoryValue: stock[0]?.value || 0,
    inventoryCount: stock[0]?.count || 0,
  });
});

// ---------- settings ----------
router.get('/settings', async (req, res) => {
  const settings = (await Settings.findOne({ key: 'main' })) || new Settings({ key: 'main' });
  res.json({ settings });
});

router.put('/settings', async (req, res) => {
  const allowed = ['showroomName', 'tagline', 'supportEmail', 'supportPhone', 'address', 'currency', 'instagramUrl', 'facebookUrl', 'twitterUrl'];
  const update = {};
  for (const key of allowed) if (req.body[key] !== undefined) update[key] = String(req.body[key]).trim();
  if (update.showroomName === '') return bad(res, 'Showroom name is required');
  const settings = await Settings.findOneAndUpdate({ key: 'main' }, { $set: update }, { new: true, upsert: true });
  await ActivityLog.log('settings', 'Store settings updated');
  res.json({ settings });
});

module.exports = router;
module.exports.cleanCar = cleanCar;
module.exports.COLOR_PALETTE = COLOR_PALETTE;
module.exports.CAR_DEFAULTS = CAR_DEFAULTS;
