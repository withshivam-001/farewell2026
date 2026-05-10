const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    videoUrl: {
      type: String,
      required: true,
    },
    videoPublicId: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    thumbnailPublicId: { type: String, default: '' },
    duration: { type: Number, default: 0 }, // seconds
    category: {
      type: String,
      enum: ['farewell', 'memories', 'highlights', 'other'],
      default: 'farewell',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPremium: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

videoSchema.index({ category: 1, isApproved: 1 });
videoSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Video', videoSchema);
