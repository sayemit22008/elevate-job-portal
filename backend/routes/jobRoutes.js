const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { verifyToken, isHR } = require('../middleware/auth');

// Public or general seeker routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobDetails);

// HR specific routes
router.post('/', verifyToken, isHR, jobController.postJob);
router.get('/hr/my-jobs', verifyToken, isHR, jobController.getHrJobs);
router.put('/:id', verifyToken, isHR, jobController.updateJob);
router.delete('/:id', verifyToken, isHR, jobController.deleteJob);

module.exports = router;
