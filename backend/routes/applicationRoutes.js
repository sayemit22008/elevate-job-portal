const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { verifyToken, isSeeker, isHR } = require('../middleware/auth');

// Seeker routes
router.post('/apply/:jobId', verifyToken, isSeeker, applicationController.applyForJob);
router.get('/my-applications', verifyToken, isSeeker, applicationController.getSeekerApplications);

// HR routes
router.get('/job/:jobId', verifyToken, isHR, applicationController.getJobApplicants);
router.put('/:id', verifyToken, isHR, applicationController.updateApplicationStatus);

module.exports = router;
