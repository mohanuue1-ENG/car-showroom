const mongoose = require('mongoose');

// Feeds the "Recent activities" list on the admin dashboard
const activitySchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['car', 'sale', 'inquiry', 'test_drive', 'customer', 'settings'], required: true },
    message: { type: String, required: true, maxlength: 300 },
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activitySchema);

module.exports.log = (kind, message) =>
  mongoose.model('ActivityLog').create({ kind, message }).catch(() => {});
