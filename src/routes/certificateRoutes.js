const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const auth = require('../middleware/auth');

router.get('/download/:courseId', auth, certificateController.downloadCertificate);
router.get('/check/:courseId', auth, certificateController.checkAvailability);
router.get('/generate/:courseId', auth, certificateController.generate);

module.exports = router;