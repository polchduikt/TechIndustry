const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protectPage } = require('../middleware/pageAuth');

router.get('/', quizController.renderCourseSelection);
router.get('/:slug', quizController.renderQuizList);
router.get('/:slug/:moduleId', protectPage, quizController.renderQuiz);
router.post('/:slug/:moduleId/submit', protectPage, quizController.submitQuiz);

module.exports = router;