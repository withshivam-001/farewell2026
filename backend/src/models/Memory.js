const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [400, 'Description cannot exceed 400 characters'],
      default: '',
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        caption: { type: String, default: '' },
      },
    ],
    coverImage: { type: String, default: '' },
    date: { type: Date },
    tags: [{ type: String, trim: true }],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Memory', memorySchema);
