const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const { protect, approvedOnly, adminOnly } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');

router.get('/', protect, approvedOnly, async (req, res) => {
  try {
    const memories = await Memory.find({ isApproved: true })
      .populate('uploadedBy', 'name avatar')
      .sort({ isFeatured: -1, order: 1, date: -1 });
    res.json({ memories });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', protect, approvedOnly, uploadImage.array('images', 20), async (req, res) => {
  try {
    const { title, description, date, tags } = req.body;
    if (!req.files?.length) return res.status(400).json({ error: 'At least one image required' });
    const images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    const memory = await Memory.create({
      title, description, date,
      tags: tags ? JSON.parse(tags) : [],
      images, coverImage: images[0].url,
      uploadedBy: req.user._id,
      isApproved: req.user.role === 'admin',
    });
    res.status(201).json({ memory });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const memory = await Memory.findByIdAndDelete(req.params.id);
    if (!memory) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Memory deleted' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
