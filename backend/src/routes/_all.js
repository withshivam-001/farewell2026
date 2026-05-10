// ─── routes/memories.js ──────────────────────────────────────────
const express = require('express');
const memoriesRouter = express.Router();
const Memory = require('../models/Memory');
const { protect, approvedOnly, adminOnly } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');

memoriesRouter.get('/', protect, approvedOnly, async (req, res) => {
  try {
    const memories = await Memory.find({ isApproved: true })
      .populate('uploadedBy', 'name avatar')
      .sort({ isFeatured: -1, order: 1, date: -1 });
    res.json({ memories });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

memoriesRouter.post('/', protect, approvedOnly, uploadImage.array('images', 20), async (req, res) => {
  try {
    const { title, description, date, tags } = req.body;
    if (!req.files?.length) return res.status(400).json({ error: 'At least one image required' });
    const images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    const memory = await Memory.create({
      title, description, date, tags: tags ? JSON.parse(tags) : [],
      images, coverImage: images[0].url,
      uploadedBy: req.user._id,
      isApproved: req.user.role === 'admin',
    });
    res.status(201).json({ memory });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

memoriesRouter.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const memory = await Memory.findByIdAndDelete(req.params.id);
    if (!memory) return res.status(404).json({ error: 'Memory not found' });
    res.json({ message: 'Memory deleted' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ─── routes/groups.js ────────────────────────────────────────────
const groupsRouter = express.Router();
const Group = require('../models/Group');

groupsRouter.get('/', protect, approvedOnly, async (req, res) => {
  try {
    const groups = await Group.find({ isPublic: true })
      .populate('members.user', 'name avatar')
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ groups });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

groupsRouter.post('/', protect, adminOnly, uploadImage.single('avatar'), async (req, res) => {
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

groupsRouter.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ─── routes/users.js ─────────────────────────────────────────────
const usersRouter = express.Router();
const User = require('../models/User');
const { uploadAvatar } = require('../config/cloudinary');
const { UploadRequest } = require('../models/Settings');

usersRouter.patch('/profile', protect, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.bio) updates.bio = req.body.bio;
    if (req.body.socialLinks) updates.socialLinks = JSON.parse(req.body.socialLinks);
    if (req.file) { updates.avatar = req.file.path; updates.avatarPublicId = req.file.filename; }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

usersRouter.post('/upload-request', protect, approvedOnly, async (req, res) => {
  try {
    const existing = await UploadRequest.findOne({ user: req.user._id, status: 'pending' });
    if (existing) return res.status(409).json({ error: 'You already have a pending request' });
    const request = await UploadRequest.create({ user: req.user._id, message: req.body.message });
    res.status(201).json({ request });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ─── routes/payment.js ───────────────────────────────────────────
const paymentRouter = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Payment, SiteSettings } = require('../models/Settings');

paymentRouter.get('/status', async (req, res) => {
  try {
    const setting = await SiteSettings.findOne({ key: 'payment_enabled' });
    res.json({ enabled: setting?.value === true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

paymentRouter.post('/create-order', protect, async (req, res) => {
  try {
    const setting = await SiteSettings.findOne({ key: 'payment_enabled' });
    if (!setting?.value) return res.status(403).json({ error: 'Payments are currently disabled' });
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const amount = 19900; // ₹199 in paise
    const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: `rcpt_${Date.now()}` });
    await Payment.create({ user: req.user._id, orderId: order.id, amount, status: 'created' });
    res.json({ orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

paymentRouter.post('/verify', protect, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`).digest('hex');
    if (expectedSig !== signature) return res.status(400).json({ error: 'Invalid payment signature' });
    await Payment.findOneAndUpdate({ orderId }, { paymentId, signature, status: 'paid' });
    await User.findByIdAndUpdate(req.user._id, { isPremium: true });
    res.json({ message: 'Payment verified. Premium access granted!' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ─── routes/settings.js ──────────────────────────────────────────
const settingsRouter = express.Router();

settingsRouter.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.find().select('key value');
    const obj = {};
    settings.forEach((s) => { obj[s.key] = s.value; });
    res.json({ settings: obj });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

settingsRouter.patch('/:key', protect, adminOnly, async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await SiteSettings.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedBy: req.user._id },
      { new: true, upsert: true }
    );
    res.json({ setting });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = {
  memoriesRouter,
  groupsRouter,
  usersRouter,
  paymentRouter,
  settingsRouter,
};
