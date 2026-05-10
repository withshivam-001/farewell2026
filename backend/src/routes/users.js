const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, approvedOnly } = require('../middleware/auth');
const { uploadAvatar, uploadImage } = require('../config/cloudinary');
const { UploadRequest, GroupRequest, GroupImage } = require('../models/Settings');
const Group = require('../models/Group');

// ── Edit profile ──────────────────────────────────────────────────
router.patch('/profile', protect, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.socialLinks) {
      try { updates.socialLinks = JSON.parse(req.body.socialLinks); } catch {}
    }
    if (req.file) {
      updates.avatar = req.file.path;
      updates.avatarPublicId = req.file.filename;
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ── Video Upload Request ──────────────────────────────────────────
router.post('/upload-request', protect, async (req, res) => {
  try {
    if (!req.user.isApproved) {
      return res.status(403).json({ error: 'Account approved nahi hai abhi' });
    }
    const { title, description, driveUrl, category } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title zaroori hai' });
    }
    if (!driveUrl || !driveUrl.trim()) {
      return res.status(400).json({ error: 'Google Drive URL zaroori hai' });
    }

    const existing = await UploadRequest.findOne({
      user: req.user._id,
      status: 'pending'
    });
    if (existing) {
      return res.status(409).json({ error: 'Ek pending request already hai. Admin review karne ka wait karo.' });
    }

    const request = await UploadRequest.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      driveUrl: driveUrl.trim(),
      category: category || 'farewell',
    });

    await request.populate('user', 'name email avatar');
    res.status(201).json({ request, message: 'Request bhej di! Admin review karenge.' });
  } catch (err) {
    console.error('Upload request error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Get my upload requests
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await UploadRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Group Request ─────────────────────────────────────────────────
router.post('/group-request', protect, async (req, res) => {
  try {
    if (!req.user.isApproved) {
      return res.status(403).json({ error: 'Account approved nahi hai abhi' });
    }
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group naam zaroori hai' });
    }

    const existing = await GroupRequest.findOne({
      user: req.user._id,
      status: 'pending'
    });
    if (existing) {
      return res.status(409).json({ error: 'Ek pending group request already hai' });
    }

    const request = await GroupRequest.create({
      user: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
    });

    await request.populate('user', 'name email avatar');
    res.status(201).json({ request, message: 'Group request bhej di! Admin approve karenge.' });
  } catch (err) {
    console.error('Group request error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Get my group requests
router.get('/my-group-requests', protect, async (req, res) => {
  try {
    const requests = await GroupRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Group Image Submission ────────────────────────────────────────
router.post('/group-images', protect, uploadImage.array('images', 20), async (req, res) => {
  try {
    if (!req.user.isApproved) {
      return res.status(403).json({ error: 'Account approved nahi hai abhi' });
    }
    const { groupId, caption } = req.body;
    if (!groupId) return res.status(400).json({ error: 'Group ID zaroori hai' });
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Kam se kam ek image upload karo' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group nahi mila' });

    const images = req.files.map(f => ({
      url: f.path,
      publicId: f.filename,
      caption: '',
    }));

    const submission = await GroupImage.create({
      group: groupId,
      uploadedBy: req.user._id,
      images,
      caption: caption || '',
    });

    res.status(201).json({ submission, message: 'Images submit ho gayi! Admin review karenge.' });
  } catch (err) {
    console.error('Group image error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Get approved images of a group
router.get('/group-images/:groupId', protect, async (req, res) => {
  try {
    const images = await GroupImage.find({
      group: req.params.groupId,
      status: 'approved'
    }).populate('uploadedBy', 'name avatar').sort({ createdAt: -1 });
    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
