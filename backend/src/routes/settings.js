const express = require('express');
const router = express.Router();
const { SiteSettings } = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.find().select('key value');
    const obj = {};
    settings.forEach((s) => { obj[s.key] = s.value; });
    res.json({ settings: obj });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.patch('/:key', protect, adminOnly, async (req, res) => {
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

module.exports = router;
