const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// ✅ СПИСОК КУРСІВ
router.get('/courses', courseController.getAllCourses);

// ✅ ОДИН КУРС
router.get('/courses/:slug', courseController.getCourseBySlug);

// markdown уроку
router.get('/lessons/:lessonId', courseController.getLessonContent);


module.exports = router;
