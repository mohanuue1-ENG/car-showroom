// Seeds the database with categories, a showroom inventory, an admin account and settings.
// Run with: npm run seed   (safe to re-run; it only fills in what is missing)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Car = require('../models/Car');
const Settings = require('../models/Settings');
const { slugify } = require('./helpers');

// Photos are Unsplash images (images.unsplash.com), free to use.
const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const CATEGORIES = [
  { name: 'SUVs', description: 'Space, all-weather capability and commanding road presence.', image: img('1622893288761-823ba60f17a6') },
  { name: 'Sedans', description: 'Refined comfort for every journey.', image: img('1610099610040-ab19f3a5ec35') },
  { name: 'Sports Cars', description: 'Performance engineering built to be driven.', image: img('1757910869244-9f723dc34309') },
  { name: 'Luxury Cars', description: 'The finest materials and the most considered craftsmanship.', image: img('1522255272218-7ac5249be344') },
  { name: 'Electric Cars', description: 'Silent, instant acceleration with zero tailpipe emissions.', image: img('1773866117133-c0b3c85e2af1') },
  { name: 'Pickup Trucks', description: 'Work-ready capability with a comfortable cabin.', image: img('1598248691267-4a62dfdfd8a8') },
  { name: 'Trucks', description: 'Heavy-duty trucks for demanding work and off-road use.', image: img('1612057473166-af2affdb92ad') },
];

// Each car is tied to a category by name. Specs are sample values for a demo showroom.
const CARS = [
  { make: 'Mercedes-Benz', model: 'S 500 4MATIC', year: 2022, price: 118500, mileage: 12400, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'Sedan', condition: 'used', category: 'Sedans', engine: '3.0L inline-6 turbo', exteriorColor: 'Obsidian Black', interiorColor: 'Macchiato Beige', vin: 'WDDUG8CB9NA123456', location: 'Springfield, IL', featured: true, photos: ['1610099610040-ab19f3a5ec35'], description: 'One owner, full Mercedes-Benz service history, Burmester surround sound and Night Package.' },
  { make: 'BMW', model: 'M4 Competition', year: 2021, price: 74900, mileage: 18000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'Coupe', condition: 'used', category: 'Sports Cars', engine: '3.0L twin-turbo inline-6', exteriorColor: 'Isle of Man Green', interiorColor: 'Black Merino', vin: 'WBS8M9C02M5K12345', location: 'Springfield, IL', featured: true, photos: ['1580273916550-e323be2ae537'], description: 'M Driver’s Package, carbon ceramic brakes and adaptive suspension. Showroom condition.' },
  { make: 'Porsche', model: 'Panamera 4S', year: 2023, price: 129000, mileage: 4200, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'Sedan', condition: 'used', category: 'Luxury Cars', engine: '2.9L V6 twin-turbo', exteriorColor: 'Jet Black', interiorColor: 'Black Leather', vin: 'WP0AB2A71PL123456', location: 'Springfield, IL', featured: true, photos: ['1503376780353-7e6692767b70'], description: 'Sport Chrono package, 21-inch wheels and a panoramic roof. Certified pre-owned.' },
  { make: 'Audi', model: 'Q7 55 TFSI quattro', year: 2020, price: 52900, mileage: 34500, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'SUV', condition: 'used', category: 'SUVs', engine: '3.0L V6 turbo', exteriorColor: 'Navarra Blue', interiorColor: 'Black', vin: 'WA1LXAF7XLD123456', location: 'Shelbyville, IL', featured: false, photos: ['1615063029891-497bebd4f03c'], description: 'Seven seats, quattro all-wheel drive, virtual cockpit and a tow package.' },
  { make: 'Toyota', model: 'Land Cruiser Prado', year: 2019, price: 46800, mileage: 58000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'SUV', condition: 'used', category: 'SUVs', engine: '2.8L turbo diesel', exteriorColor: 'Silver', interiorColor: 'Grey Cloth', vin: 'JTEBU5JR9K5123456', location: 'Shelbyville, IL', featured: false, photos: ['1622893288761-823ba60f17a6'], description: 'Four-wheel drive, reinforced suspension and a full set of service records.' },
  { make: 'Land Rover', model: 'Range Rover Sport', year: 2024, price: 98000, mileage: 0, fuel: 'Hybrid', transmission: 'Automatic', bodyType: 'SUV', condition: 'new', category: 'SUVs', engine: '3.0L inline-6 mild hybrid', exteriorColor: 'Carpathian Grey', interiorColor: 'Ebony', vin: 'SALWA2EU5RA123456', location: 'Springfield, IL', featured: true, photos: ['1771463719499-1c7863651283'], description: 'Brand-new Range Rover Sport with Meridian sound, air suspension and a 21-inch wheel package.' },
  { make: 'Mercedes-AMG', model: 'GT 63 S', year: 2023, price: 165000, mileage: 0, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'Coupe', condition: 'new', category: 'Sports Cars', engine: '4.0L V8 biturbo', exteriorColor: 'Selenite Grey', interiorColor: 'Black Nappa', vin: 'W1KYJ8BA2PA123456', location: 'Springfield, IL', featured: true, photos: ['1757910869244-9f723dc34309'], description: 'Brand-new AMG GT 63 S with 4-door coupe body and AMG Performance seats.' },
  { make: 'Ferrari', model: '488 GTB', year: 2019, price: 239000, mileage: 9800, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'Coupe', condition: 'used', category: 'Sports Cars', engine: '3.9L twin-turbo V8', exteriorColor: 'Rosso Corsa', interiorColor: 'Black', vin: 'ZFF79ALA5K0123456', location: 'Chicago, IL', featured: true, photos: ['1583121274602-3e2820c69888'], description: 'Carbon fibre trim, lifting system and a complete Ferrari service history.' },
  { make: 'Chevrolet', model: 'Corvette Stingray', year: 2021, price: 84500, mileage: 8000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'Coupe', condition: 'used', category: 'Sports Cars', engine: '6.2L V8', exteriorColor: 'Red Mist', interiorColor: 'Adrenaline Red', vin: '1G1YB2D41M5123456', location: 'Chicago, IL', featured: false, photos: ['1614200179396-2bdb77ebf81b'], description: 'Performance exhaust, magnetic ride control and a sport package.' },
  { make: 'McLaren', model: '720S', year: 2019, price: 229000, mileage: 15000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'Coupe', condition: 'used', category: 'Luxury Cars', engine: '4.0L twin-turbo V8', exteriorColor: 'Papaya Orange', interiorColor: 'Black Alcantara', vin: 'SBM14FCA2KW123456', location: 'Chicago, IL', featured: false, photos: ['1542362567-b07e54358753'], description: 'Dihedral doors, carbon monocoque and a comprehensive service history.' },
  { make: 'Ford', model: 'F-150 Raptor', year: 2018, price: 58000, mileage: 46000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'Pickup', condition: 'used', category: 'Pickup Trucks', engine: '3.5L EcoBoost V6', exteriorColor: 'Shadow Black', interiorColor: 'Black', vin: '1FTFW1RG5JFA12345', location: 'Shelbyville, IL', featured: false, photos: ['1598248691267-4a62dfdfd8a8'], description: 'Off-road suspension, bed liner and all-terrain tyres. Ready for work or weekends.' },
  { make: 'Land Rover', model: 'Defender 110', year: 2023, price: 71500, mileage: 14000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'SUV', condition: 'used', category: 'SUVs', engine: '3.0L inline-6 diesel', exteriorColor: 'Gondwana Stone', interiorColor: 'Ebony', vin: 'SALE2EEU4P2123456', location: 'Springfield, IL', featured: false, photos: ['1612563893490-d86ed296e5e6'], description: 'Adventure pack, roof rack and a full terrain response system.' },
  { make: 'Jeep', model: 'Wrangler Rubicon', year: 2020, price: 42500, mileage: 27000, fuel: 'Petrol', transmission: 'Manual', bodyType: 'SUV', condition: 'used', category: 'SUVs', engine: '3.6L V6', exteriorColor: 'Black', interiorColor: 'Black', vin: '1C4HJXFG5LW123456', location: 'Springfield, IL', featured: false, photos: ['1506015391300-4802dc74de2e'], description: 'Rubicon off-road package, hardtop and upgraded tyres.' },
  { make: 'Ford', model: 'Mustang GT', year: 2019, price: 36900, mileage: 31000, fuel: 'Petrol', transmission: 'Manual', bodyType: 'Coupe', condition: 'used', category: 'Sports Cars', engine: '5.0L V8', exteriorColor: 'Grey', interiorColor: 'Ebony', vin: '1FA6P8CF0K5123456', location: 'Shelbyville, IL', featured: false, photos: ['1625231334168-35067f8853ed'], description: 'Six-speed manual, active exhaust and a performance pack.' },
  { make: 'Demo EV', model: 'Crossover AWD', year: 2024, price: 46900, mileage: 0, fuel: 'Electric', transmission: 'Automatic', bodyType: 'SUV', condition: 'new', category: 'Electric Cars', engine: 'Dual motor AWD', exteriorColor: 'Pearl White', interiorColor: 'Grey', vin: 'JTMAB3FV2RD123456', location: 'Springfield, IL', featured: false, photos: ['1775114501677-18ba958f38c6'], description: 'New electric crossover with long range, fast charging and a panoramic roof.' },
  { make: 'Demo EV', model: 'GT Concept', year: 2025, price: 189000, mileage: 0, fuel: 'Electric', transmission: 'Automatic', bodyType: 'Coupe', condition: 'new', category: 'Electric Cars', engine: 'Tri-motor AWD', exteriorColor: 'Pearl', interiorColor: 'Cream', vin: '1EC25GT0N5123456', location: 'Chicago, IL', featured: true, photos: ['1773866117133-c0b3c85e2af1'], description: 'Limited-run electric grand tourer with torque vectoring and a bespoke interior.' },
];

async function seed() {
  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@showroom.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  if (!(await User.exists({ email: adminEmail }))) {
    await User.create({
      name: 'Showroom Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'admin',
    });
    console.log(`Created admin ${adminEmail}`);
  }

  await Settings.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { upsert: true });

  const categoryIds = {};
  for (const c of CATEGORIES) {
    let cat = await Category.findOne({ name: c.name });
    if (!cat) cat = await Category.create({ ...c, slug: slugify(c.name) });
    categoryIds[c.name] = cat._id;
  }

  if ((await Car.countDocuments()) === 0) {
    await Car.insertMany(
      CARS.map(({ photos, featured, category, ...c }) => ({
        ...c,
        isFeatured: !!featured,
        category: categoryIds[category],
        images: photos.map(img),
      }))
    );
    console.log(`Seeded ${CARS.length} cars`);
  }

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
