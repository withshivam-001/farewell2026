const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Payment, SiteSettings } = require('../models/Settings');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/status', async (req, res) => {
  try {
    const setting = await SiteSettings.findOne({ key: 'payment_enabled' });
    res.json({ enabled: setting?.value === true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/create-order', protect, async (req, res) => {
  try {
    const setting = await SiteSettings.findOne({ key: 'payment_enabled' });
    if (!setting?.value) return res.status(403).json({ error: 'Payments are currently disabled' });
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const amount = 19900;
    const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: `rcpt_${Date.now()}` });
    await Payment.create({ user: req.user._id, orderId: order.id, amount, status: 'created' });
    res.json({ orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`).digest('hex');
    if (expectedSig !== signature) return res.status(400).json({ error: 'Invalid signature' });
    await Payment.findOneAndUpdate({ orderId }, { paymentId, signature, status: 'paid' });
    await User.findByIdAndUpdate(req.user._id, { isPremium: true });
    res.json({ message: 'Payment verified. Premium access granted!' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/history', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
