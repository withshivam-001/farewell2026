// ─── routes/videos.js ────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { protect, approvedOnly } = require('../middleware/auth');
const { uploadVideo, uploadImage, cloudinary } = require('../config/cloudinary');

// Get approved videos (public)
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const query = { isApproved: true };
    if (category && category !== 'all') query.category = category;
    const videos = await Video.find(query)
      .populate('uploadedBy', 'name avatar')
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Video.countDocuments(query);
    res.json({ videos, total });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('uploadedBy', 'name avatar');
    if (!video || !video.isApproved) return res.status(404).json({ error: 'Video not found' });
    video.views += 1;
    await video.save();
    res.json({ video });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload video (admin or approved user with permission)
router.post('/', protect, approvedOnly,
  uploadVideo.single('video'),
  async (req, res) => {
    try {
      const { title, description, category } = req.body;
      if (!req.file) return res.status(400).json({ error: 'Video file required' });
      const isAdmin = req.user.role === 'admin';
      const video = await Video.create({
        title,
        description,
        category: category || 'farewell',
        videoUrl: req.file.path,
        videoPublicId: req.file.filename,
        uploadedBy: req.user._id,
        isApproved: isAdmin,
      });
      res.status(201).json({ video });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Like video
router.post('/:id/like', protect, approvedOnly, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const idx = video.likes.indexOf(req.user._id);
    if (idx === -1) video.likes.push(req.user._id);
    else video.likes.splice(idx, 1);
    await video.save();
    res.json({ likes: video.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
