const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { protect, approvedOnly } = require('../middleware/auth');

// Get wall comments (approved users only)
router.get('/', protect, approvedOnly, async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const comments = await Comment.find({ isDeleted: false })
      .populate('author', 'name avatar batch')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Comment.countDocuments({ isDeleted: false });
    res.json({ comments, total });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Post comment
router.post('/', protect, approvedOnly, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text required' });
    const comment = await Comment.create({ author: req.user._id, text: text.trim() });
    await comment.populate('author', 'name avatar batch');
    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete own comment
router.delete('/:id', protect, approvedOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    comment.isDeleted = true;
    comment.deletedBy = req.user._id;
    await comment.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Like comment
router.post('/:id/like', protect, approvedOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const idx = comment.likes.indexOf(req.user._id);
    if (idx === -1) comment.likes.push(req.user._id);
    else comment.likes.splice(idx, 1);
    await comment.save();
    res.json({ likes: comment.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
