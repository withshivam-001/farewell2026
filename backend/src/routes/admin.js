const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadVideo, uploadImage } = require('../config/cloudinary');

router.use(protect, adminOnly);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Users
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/approve', adminController.approveUser);
router.patch('/users/:id/reject', adminController.rejectUser);
router.patch('/users/:id/make-admin', adminController.makeAdmin);
router.delete('/users/:id', adminController.deleteUser);

// Videos - admin uploads directly
router.get('/videos', adminController.getAllVideos);
router.post('/videos/upload', uploadVideo.single('video'), adminController.uploadVideo);
router.post('/videos/thumbnail', uploadImage.single('thumbnail'), adminController.uploadThumbnail);
router.patch('/videos/:id/approve', adminController.approveVideo);
router.patch('/videos/:id/feature', adminController.featureVideo);
router.delete('/videos/:id', adminController.deleteVideo);

// Video upload requests (user submitted)
router.get('/upload-requests', adminController.getUploadRequests);
router.patch('/upload-requests/:id', adminController.updateUploadRequest);

// Group requests
router.get('/group-requests', adminController.getGroupRequests);
router.patch('/group-requests/:id/approve', adminController.approveGroupRequest);
router.patch('/group-requests/:id/reject', adminController.rejectGroupRequest);

// Group image submissions
router.get('/group-image-submissions', adminController.getGroupImageSubmissions);
router.patch('/group-image-submissions/:id/approve', adminController.approveGroupImages);
router.patch('/group-image-submissions/:id/reject', adminController.rejectGroupImages);

// Comments
router.get('/comments', adminController.getAllComments);
router.delete('/comments/:id', adminController.deleteComment);
router.patch('/comments/:id/pin', adminController.pinComment);

module.exports = router;
