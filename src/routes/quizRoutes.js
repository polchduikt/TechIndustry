const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protectPage } = require('../middleware/pageAuth');
const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('../config/constants');
const quizLimiter = rateLimit(RATE_LIMITS.QUIZ_SUBMIT);

router.get('/', quizController.renderCourseSelection);
router.get('/:slug', quizController.renderQuizList);
router.get('/:slug/:moduleId', protectPage, quizController.renderQuiz);

router.post('/:slug/:moduleId/submit', protectPage, quizLimiter, quizController.submitQuiz);

module.exports = router;