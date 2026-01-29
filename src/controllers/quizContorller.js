const QuizService = require('../services/quizService');

exports.getQuiz = async (req, res) => {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    const quiz = QuizService.sanitizeQuizForClient(lesson.content_path);
    res.json(quiz);
};

exports.submitQuiz = async (req, res) => {
    const { lessonId, answers } = req.body;
    const lesson = await Lesson.findByPk(lessonId);

    const result = QuizService.checkQuiz(
        lesson.content_path,
        answers
    );

    res.json(result);
};
