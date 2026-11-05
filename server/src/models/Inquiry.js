const mongoose = require('mongoose');

// One model for both general inquiries and test-drive requests (type: 'inquiry' | 'test_drive')
const INQUIRY_STATUSES = ['new', 'in_progress', 'responded', 'closed'];
const TEST_DRIVE_STATUSES = ['requested', 'confirmed', 'completed', 'cancelled'];

const inquirySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['inquiry', 'test_drive'], required: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true, maxlength: 30 },
    message: { type: String, default: '', maxlength: 2000 },
    // Test drive only
    preferredDate: { type: Date, default: null },
    preferredTime: { type: String, default: '' },
    status: { type: String, default: 'new' },
    replies: [
      {
        message: { type: String, required: true, maxlength: 2000 },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

inquirySchema.index({ user: 1, createdAt: -1 });
inquirySchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
module.exports.INQUIRY_STATUSES = INQUIRY_STATUSES;
module.exports.TEST_DRIVE_STATUSES = TEST_DRIVE_STATUSES;
