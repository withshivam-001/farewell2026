const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const Memory = require('../models/Memory');
const Group = require('../models/Group');
const { Payment, UploadRequest, GroupRequest, GroupImage } = require('../models/Settings');
const { cloudinary } = require('../config/cloudinary');

// ─── Analytics ────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const [totalUsers, approvedUsers, pendingUsers, totalVideos, totalComments,
      totalGroups, payments, recentUsers, pendingVR, pendingGR, pendingGI] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: true }),
      User.countDocuments({ isApproved: false, isEmailVerified: true }),
      Video.countDocuments(),
      Comment.countDocuments({ isDeleted: false }),
      Group.countDocuments(),
      Payment.countDocuments({ status: 'paid' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email avatar createdAt isApproved'),
      UploadRequest.countDocuments({ status: 'pending' }),
      GroupRequest.countDocuments({ status: 'pending' }),
      GroupImage.countDocuments({ status: 'pending' }),
    ]);
    res.json({
      users: { total: totalUsers, approved: approvedUsers, pending: pendingUsers },
      videos: { total: totalVideos },
      comments: totalComments,
      groups: totalGroups,
      payments,
      recentUsers,
      pendingRequests: { videos: pendingVR, groups: pendingGR, groupImages: pendingGI },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// ─── Users ────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, approved, role } = req.query;
    const query = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (approved !== undefined) query.isApproved = approved === 'true';
    if (role) query.role = role;
    const users = await User.find(query).sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User nahi mila' });
    res.json({ message: 'User approved', user });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'User nahi mila' });
    res.json({ message: 'User unapproved', user });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User nahi mila' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Admin ko delete nahi kar sakte' });
    if (user.avatarPublicId) {
      try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch {}
    }
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,
      { role: 'admin', isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User nahi mila' });
    res.json({ message: 'Admin ban gaya', user });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── Videos ───────────────────────────────────────────────────────
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ videos, total: videos.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Video file zaroori hai' });
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title zaroori hai' });

    const video = await Video.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category || 'farewell',
      videoUrl: req.file.path,
      videoPublicId: req.file.filename,
      uploadedBy: req.user._id,
      isApproved: true,
    });
    await video.populate('uploadedBy', 'name avatar');
    res.status(201).json({ video, message: 'Video upload ho gaya!' });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ error: 'Video upload fail: ' + err.message });
  }
};

exports.uploadThumbnail = async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!req.file || !videoId) return res.status(400).json({ error: 'Image aur videoId zaroori hai' });
    const video = await Video.findByIdAndUpdate(videoId,
      { thumbnailUrl: req.file.path, thumbnailPublicId: req.file.filename }, { new: true });
    if (!video) return res.status(404).json({ error: 'Video nahi mila' });
    res.json({ video });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.approveVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!video) return res.status(404).json({ error: 'Video nahi mila' });
    res.json({ message: 'Video approved', video });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video nahi mila' });
    try {
      await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: 'video' });
      if (video.thumbnailPublicId) await cloudinary.uploader.destroy(video.thumbnailPublicId);
    } catch (e) { console.warn('Cloudinary delete warning:', e.message); }
    await video.deleteOne();
    res.json({ message: 'Video deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.featureVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id,
      { isFeatured: req.body.featured }, { new: true });
    if (!video) return res.status(404).json({ error: 'Video nahi mila' });
    res.json({ video });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── Video Upload Requests ─────────────────────────────────────────
exports.getUploadRequests = async (req, res) => {
  try {
    const requests = await UploadRequest.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateUploadRequest = async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    if (!status) return res.status(400).json({ error: 'Status zaroori hai' });
    const request = await UploadRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminReply: adminReply || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate('user', 'name email');
    if (!request) return res.status(404).json({ error: 'Request nahi mila' });
    res.json({ request, message: 'Request update ho gaya' });
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── Group Requests ────────────────────────────────────────────────
exports.getGroupRequests = async (req, res) => {
  try {
    const requests = await GroupRequest.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.approveGroupRequest = async (req, res) => {
  try {
    const { adminReply } = req.body;
    const gReq = await GroupRequest.findById(req.params.id).populate('user', 'name email _id');
    if (!gReq) return res.status(404).json({ error: 'Request nahi mila' });
    if (gReq.status !== 'pending') {
      return res.status(400).json({ error: 'Yeh request already reviewed hai' });
    }

    // Create the actual group
    const group = await Group.create({
      name: gReq.name,
      description: gReq.description || '',
      createdBy: gReq.user._id,
    });

    gReq.status = 'approved';
    gReq.adminReply = adminReply || 'Group approve ho gaya!';
    gReq.approvedGroupId = group._id;
    gReq.reviewedBy = req.user._id;
    gReq.reviewedAt = new Date();
    await gReq.save();

    res.json({ request: gReq, group, message: 'Group create ho gaya!' });
  } catch (err) {
    console.error('Approve group error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

exports.rejectGroupRequest = async (req, res) => {
  try {
    const { adminReply } = req.body;
    const gReq = await GroupRequest.findById(req.params.id);
    if (!gReq) return res.status(404).json({ error: 'Request nahi mila' });
    gReq.status = 'rejected';
    gReq.adminReply = adminReply || 'Request reject ho gaya';
    gReq.reviewedBy = req.user._id;
    gReq.reviewedAt = new Date();
    await gReq.save();
    res.json({ request: gReq });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── Group Image Submissions ───────────────────────────────────────
exports.getGroupImageSubmissions = async (req, res) => {
  try {
    const submissions = await GroupImage.find()
      .populate('uploadedBy', 'name email avatar')
      .populate('group', 'name')
      .sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.approveGroupImages = async (req, res) => {
  try {
    const { adminReply } = req.body;
    const submission = await GroupImage.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission nahi mili' });
    if (submission.status !== 'pending') {
      return res.status(400).json({ error: 'Yeh submission already reviewed hai' });
    }

    const group = await Group.findById(submission.group);
    if (!group) return res.status(404).json({ error: 'Group nahi mila' });

    submission.images.forEach(img => {
      group.images.push({
        url: img.url,
        publicId: img.publicId,
        caption: img.caption || '',
        uploadedBy: submission.uploadedBy,
        addedAt: new Date(),
      });
    });
    await group.save();

    submission.status = 'approved';
    submission.adminReply = adminReply || 'Images approve ho gayi!';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    res.json({ submission, message: 'Images group mein add ho gayi!' });
  } catch (err) {
    console.error('Approve images error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

exports.rejectGroupImages = async (req, res) => {
  try {
    const { adminReply } = req.body;
    const submission = await GroupImage.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission nahi mili' });
    submission.status = 'rejected';
    submission.adminReply = adminReply || 'Images reject ho gayi';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();
    res.json({ submission });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── Comments ─────────────────────────────────────────────────────
exports.getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const comments = await Comment.find({ isDeleted: false })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Comment.countDocuments({ isDeleted: false });
    res.json({ comments, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndUpdate(req.params.id,
      { isDeleted: true, deletedBy: req.user._id });
    res.json({ message: 'Comment delete ho gaya' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.pinComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id,
      { isPinned: req.body.pinned }, { new: true });
    res.json({ comment });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
