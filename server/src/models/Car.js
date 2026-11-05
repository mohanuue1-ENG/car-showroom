const mongoose = require('mongoose');

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const BODY_TYPES = ['SUV', 'Sedan', 'Coupe', 'Convertible', 'Hatchback', 'Pickup', 'Van'];
const CONDITIONS = ['new', 'used'];
const CAR_STATUSES = ['available', 'reserved', 'sold'];

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, trim: true, maxlength: 60 },
    model: { type: String, required: true, trim: true, maxlength: 80 },
    year: { type: Number, required: true, min: 1950, max: 2100 },
    price: { type: Number, required: true, min: 0 },
    mileage: { type: Number, required: true, min: 0, default: 0 },
    fuel: { type: String, enum: FUEL_TYPES, required: true },
    transmission: { type: String, enum: TRANSMISSIONS, required: true },
    bodyType: { type: String, enum: BODY_TYPES, required: true },
    condition: { type: String, enum: CONDITIONS, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    engine: { type: String, default: '', trim: true, maxlength: 120 },
    exteriorColor: { type: String, default: '', trim: true, maxlength: 40 },
    interiorColor: { type: String, default: '', trim: true, maxlength: 40 },
    vin: { type: String, default: '', trim: true, uppercase: true, maxlength: 17 },
    location: { type: String, default: '', trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 4000 },
    images: [{ type: String }],
    status: { type: String, enum: CAR_STATUSES, default: 'available' },
    soldPrice: { type: Number, default: null },
    soldAt: { type: Date, default: null },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

carSchema.index({ make: 'text', model: 'text', description: 'text' });
carSchema.index({ createdAt: -1 });
carSchema.index({ views: -1 });

module.exports = mongoose.model('Car', carSchema);
module.exports.FUEL_TYPES = FUEL_TYPES;
module.exports.TRANSMISSIONS = TRANSMISSIONS;
module.exports.BODY_TYPES = BODY_TYPES;
module.exports.CONDITIONS = CONDITIONS;
module.exports.CAR_STATUSES = CAR_STATUSES;
