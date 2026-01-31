const express = require('express');
const fs = require('fs');
const path = require('path');
const QuizService = require('../services/quizService');

const router = express.Router();
const COURSES_PATH = path.join(
    __dirname,
    '../../content/courses'
);

function getQuizPath(slug) {
    return path.join(
        COURSES_PATH,
        slug,
        'modules',
        'quiz.json'
    );
}

function readQuizFile(slug) {
    const quizPath = getQuizPath(slug);

    if (!fs.existsSync(quizPath)) {
        throw new Error('Quiz file not found');
    }

    return JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
}

router.get('/:slug/quizzes', (req, res) => {
    try {
        const quizzes = readQuizFile(req.params.slug);

        res.json(
            quizzes.map(q => ({
                moduleId: q.moduleId,
                title: q.title,
                passingScore: q.passingScore
            }))
        );
    } catch (e) {
        res.status(404).json({ error: e.message });
    }
});

router.get('/:slug/quizzes/:moduleId', (req, res) => {
    try {
        const quizzes = readQuizFile(req.params.slug);

        const quiz = quizzes.find(
            q => q.moduleId === req.params.moduleId
        );

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json(QuizService.sanitizeQuiz(quiz));
    } catch (e) {
        res.status(404).json({ error: e.message });
    }
});

router.post('/:slug/quizzes/:moduleId/submit', (req, res) => {
    try {
        const quizzes = readQuizFile(req.params.slug);

        const quiz = quizzes.find(
            q => q.moduleId === req.params.moduleId
        );

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const result = QuizService.checkQuiz(
            quiz,
            req.body.answers
        );

        res.json(result);
    } catch (e) {
        res.status(404).json({ error: e.message });
    }
});

module.exports = router;
