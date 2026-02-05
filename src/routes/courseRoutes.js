const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/lessons/:lessonId', courseController.getLessonContent);
router.get('/:slug', courseController.renderCourseDetail);
router.get('/', courseController.renderCourses);

module.exports = router;