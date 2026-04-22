const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isSeeker } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, req.userId + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .pdf, .doc, and .docx formats allowed!'));
    }
});

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.post('/resume', verifyToken, isSeeker, upload.single('resume'), userController.uploadResume);

// Saved Jobs (Seeker)
router.post('/save-job/:jobId', verifyToken, isSeeker, userController.saveJob);
router.get('/saved-jobs', verifyToken, isSeeker, userController.getSavedJobs);

// Dashboard stats
router.get('/dashboard-stats', verifyToken, userController.getDashboardStats);

module.exports = router;
