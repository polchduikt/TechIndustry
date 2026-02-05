const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

router.use(auth);
router.post('/start', progressController.startCourse);
router.post('/lesson', progressController.updateLessonProgress);
router.get('/', progressController.getUserProgress);

module.exports = router;