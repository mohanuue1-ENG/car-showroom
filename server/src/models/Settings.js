const mongoose = require('mongoose');

// Single document holding showroom-wide settings
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    showroomName: { type: String, default: 'Prestige Motors' },
    tagline: { type: String, default: 'Certified luxury and performance cars.' },
    supportEmail: { type: String, default: 'sales@example.com' },
    supportPhone: { type: String, default: '+1 555 0142' },
    address: { type: String, default: '1 Showroom Boulevard, Springfield' },
    currency: { type: String, default: 'USD' },
    instagramUrl: { type: String, default: '#' },
    facebookUrl: { type: String, default: '#' },
    twitterUrl: { type: String, default: '#' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
