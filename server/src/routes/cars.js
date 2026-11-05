const express = require('express');
const mongoose = require('mongoose');
const Car = require('../models/Car');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { optionalAuth } = require('../middleware/auth');
const { EMAIL_RE } = require('../utils/validate');

const router = express.Router();
const validId = (id) => mongoose.isValidObjectId(id);
const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  'year-desc': { year: -1 },
  'mileage-asc': { mileage: 1 },
  popular: { views: -1 },
};

// Builds the Mongo filter from the query string. Shared by the marketplace and admin lists.
async function buildFilter(query) {
  const filter = { status: { $ne: 'sold' } };
  if (query.q) {
    const term = escapeRe(String(query.q).trim());
    filter.$or = [
      { make: new RegExp(term, 'i') },
      { model: new RegExp(term, 'i') },
      { description: new RegExp(term, 'i') },
    ];
  }
  if (query.make) filter.make = new RegExp(`^${escapeRe(query.make)}$`, 'i');
  if (query.model) filter.model = new RegExp(escapeRe(query.model), 'i');
  if (query.fuel) filter.fuel = query.fuel;
  if (query.transmission) filter.transmission = query.transmission;
  if (query.bodyType) filter.bodyType = query.bodyType;
  if (query.condition) filter.condition = query.condition;
  if (query.status && ['available', 'reserved', 'sold'].includes(query.status)) filter.status = query.status;
  if (query.featured === 'true') filter.isFeatured = true;
  if (query.category) {
    if (validId(query.category)) filter.category = query.category;
    else {
      const Category = require('../models/Category');
      const cat = await Category.findOne({ slug: String(query.category) }).select('_id');
      filter.category = cat ? cat._id : null;
    }
  }
  const range = (field, min, max) => {
    if (min !== undefined && min !== '') filter[field] = { ...(filter[field] || {}), $gte: Number(min) };
    if (max !== undefined && max !== '') filter[field] = { ...(filter[field] || {}), $lte: Number(max) };
  };
  range('price', query.minPrice, query.maxPrice);
  range('year', query.minYear, query.maxYear);
  range('mileage', undefined, query.maxMileage);
  return filter;
}

// GET /api/cars  (public marketplace listing)
// Query: q, make, model, minPrice, maxPrice, minYear, maxYear, maxMileage, transmission, fuel,
//        bodyType, condition (new|used), category (slug), featured, sort, page, limit
// Recent / popular / new / used shelves are just sorts and filters on this endpoint.
router.get('/', async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 48);
  const filter = await buildFilter(req.query);
  const sort = SORTS[req.query.sort] || SORTS.newest;

  const [items, total] = await Promise.all([
    Car.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate('category', 'name slug'),
    Car.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

// GET /api/cars/:id  (counts a view; adds to recently viewed for logged-in users)
router.get('/:id', optionalAuth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ error: 'Car not found' });
  const car = await Car.findOneAndUpdate(
    { _id: req.params.id, status: { $ne: 'sold' } },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('category', 'name slug');
  if (!car) return res.status(404).json({ error: 'Car not found' });

  if (req.user) {
    await User.updateOne({ _id: req.user._id }, {
      $pull: { recentlyViewed: car._id },
    });
    await User.updateOne({ _id: req.user._id }, {
      $push: { recentlyViewed: { $each: [car._id], $position: 0, $slice: 10 } },
    });
  }

  const similar = await Car.find({
    _id: { $ne: car._id },
    status: 'available',
    $or: [{ category: car.category?._id || null }, { make: car.make }],
  })
    .sort({ views: -1 })
    .limit(4)
    .populate('category', 'name slug');

  res.json({ car, similar });
});

// POST /api/cars/:id/inquiries   (Contact seller / Request information)
router.post('/:id/inquiries', optionalAuth, async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  const car = validId(req.params.id) ? await Car.findById(req.params.id).select('make model year') : null;
  if (!car) return res.status(404).json({ error: 'Car not found' });
  if (!String(name || '').trim()) return res.status(400).json({ error: 'Your name is required' });
  if (!EMAIL_RE.test(String(email || '').trim())) return res.status(400).json({ error: 'A valid email is required' });
  if (String(message || '').trim().length < 10) {
    return res.status(400).json({ error: 'Please write a message of at least 10 characters' });
  }

  const inquiry = await Inquiry.create({
    type: 'inquiry',
    car: car._id,
    user: req.user ? req.user._id : null,
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone || '').trim(),
    message: String(message).trim(),
  });
  ActivityLog.log('inquiry', `New inquiry about ${car.year} ${car.make} ${car.model} from ${inquiry.name}`);
  res.status(201).json({ inquiry });
});

// POST /api/cars/:id/test-drives
router.post('/:id/test-drives', optionalAuth, async (req, res) => {
  const { name, email, phone, preferredDate, preferredTime, message } = req.body || {};
  const car = validId(req.params.id) ? await Car.findById(req.params.id).select('make model year status') : null;
  if (!car || car.status === 'sold') return res.status(404).json({ error: 'Car not found' });
  if (!String(name || '').trim()) return res.status(400).json({ error: 'Your name is required' });
  if (!EMAIL_RE.test(String(email || '').trim())) return res.status(400).json({ error: 'A valid email is required' });

  const date = new Date(preferredDate);
  if (!preferredDate || Number.isNaN(date.getTime())) return res.status(400).json({ error: 'Choose a preferred date' });
  if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
    return res.status(400).json({ error: 'Choose a date from today onward' });
  }

  const request = await Inquiry.create({
    type: 'test_drive',
    car: car._id,
    user: req.user ? req.user._id : null,
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone || '').trim(),
    preferredDate: date,
    preferredTime: String(preferredTime || '').trim(),
    message: String(message || '').trim(),
  });
  ActivityLog.log('test_drive', `Test drive requested for ${car.year} ${car.make} ${car.model} by ${request.name}`);
  res.status(201).json({ request });
});

module.exports = router;
module.exports.buildFilter = buildFilter;
module.exports.SORTS = SORTS;
