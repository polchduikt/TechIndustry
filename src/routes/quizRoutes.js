const express = require('express');
const fs = require('fs');
const path = require('path');
const QuizService = require('../services/quizService');

const router = express.Router();

const QUIZ_PATH = path.join(
    __dirname,
    '../../content/courses/javascript-basics/modules/quiz.json'
);

// 🔹 GET всі модулі
router.get('/', (req, res) => {
    try {
        const quizzes = JSON.parse(fs.readFileSync(QUIZ_PATH, 'utf-8'));
        res.json(quizzes.map(q => QuizService.sanitizeQuiz(q)));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 🔹 GET конкретний модуль
router.get('/:moduleId', (req, res) => {
    try {
        const quizzes = JSON.parse(fs.readFileSync(QUIZ_PATH, 'utf-8'));
        const quiz = quizzes.find(q => q.moduleId === req.params.moduleId);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz module not found' });
        }

        res.json(QuizService.sanitizeQuiz(quiz));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 🔹 POST відповіді
router.post('/:moduleId/submit', (req, res) => {
    try {
        const quizzes = JSON.parse(fs.readFileSync(QUIZ_PATH, 'utf-8'));
        const quiz = quizzes.find(q => q.moduleId === req.params.moduleId);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz module not found' });
        }

        const result = QuizService.checkQuiz(
            quiz,
            req.body.answers
        );

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
