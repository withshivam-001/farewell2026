const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { protect, approvedOnly, adminOnly } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');

router.get('/', protect, approvedOnly, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('members.user', 'name avatar')
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ groups });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', protect, adminOnly, uploadImage.single('avatar'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name, description,
      avatar: req.file?.path || '',
      avatarPublicId: req.file?.filename || '',
      createdBy: req.user._id,
    });
    res.status(201).json({ group });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
