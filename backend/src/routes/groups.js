const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

// Get all groups - any logged in user dekh sakta hai
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 });

    console.log(`Groups found: ${groups.length}`); // debug log
    res.json({ groups });
  } catch (err) {
    console.error('Groups fetch error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Get single group with images
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('images.uploadedBy', 'name avatar');
    if (!group) return res.status(404).json({ error: 'Group nahi mila' });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;