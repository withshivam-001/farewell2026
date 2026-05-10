const mongoose = require('mongoose');

// ─── Site Settings ───────────────────────────────────────────────
const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

// ─── Payment ─────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true },
    paymentId: { type: String, default: '' },
    signature: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
    plan: { type: String, enum: ['premium'], default: 'premium' },
  },
  { timestamps: true }
);
const Payment = mongoose.model('Payment', paymentSchema);

// ─── Video Upload Request (updated with driveUrl + adminReply) ───
const uploadRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 120 },
    description: { type: String, maxlength: 1000, default: '' },
    driveUrl: { type: String, required: true },
    category: { type: String, enum: ['farewell', 'memories', 'highlights', 'other'], default: 'farewell' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminReply: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);
const UploadRequest = mongoose.model('UploadRequest', uploadRequestSchema);

// ─── Group Request (user submits, admin approves) ────────────────
const groupRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, maxlength: 80 },
    description: { type: String, maxlength: 400, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminReply: { type: String, default: '' },
    approvedGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);
const GroupRequest = mongoose.model('GroupRequest', groupRequestSchema);

// ─── Group Image Submission (user adds images to approved group) ──
const groupImageSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        caption: { type: String, default: '' },
      }
    ],
    caption: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminReply: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);
const GroupImage = mongoose.model('GroupImage', groupImageSchema);

module.exports = { SiteSettings, Payment, UploadRequest, GroupRequest, GroupImage };
