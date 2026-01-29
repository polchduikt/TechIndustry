const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/lessons/:lessonId', courseController.getLessonContent);
router.get('/:slug', courseController.getCourseBySlug);
router.get('/', courseController.getAllCourses);

module.exports = router;
