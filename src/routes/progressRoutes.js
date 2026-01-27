const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.post('/start', progressController.startCourse);
router.get('/', progressController.getUserProgress);
router.get('/course/:courseSlug', progressController.getCourseProgress);
router.post('/lesson', progressController.updateLessonProgress);

module.exports = router;