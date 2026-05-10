const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, maxlength: 400, default: '' },
    avatar: { type: String, default: '' },
    avatarPublicId: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: true },
    batch: { type: String, default: '2024-26' },
    // Approved images inside this group
    images: [
      {
        url: { type: String },
        publicId: { type: String },
        caption: { type: String, default: '' },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
