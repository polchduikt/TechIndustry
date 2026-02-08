const fs = require('fs');
const path = require('path');
const db = require('../models');
const progressService = require('../services/progressService');
const gamificationService = require('../services/gamificationService');
const COURSES_PATH = path.join(__dirname, '../../content/courses');

function readQuizFile(slug) {
    const quizPath = path.join(COURSES_PATH, slug, 'modules', 'quiz.json');
    if (!fs.existsSync(quizPath)) return null;
    return JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
}

exports.renderCourseSelection = async (req, res) => {
    try {
        const { course: courseSlug, lessonId } = req.query;
        if (courseSlug && lessonId) {
            const lesson = await db.Lesson.findByPk(parseInt(lessonId));
            if (!lesson) {
                return res.redirect(`/quiz/${courseSlug}`);
            }
            const lessonOrder = lesson.order;
            const quizzes = readQuizFile(courseSlug);
            if (quizzes && quizzes.length > 0) {
                const orderPrefix = String(lessonOrder).padStart(2, '0') + '-';
                const matchingQuiz = quizzes.find(q =>
                    typeof q.moduleId === 'string' && q.moduleId.startsWith(orderPrefix)
                );
                if (matchingQuiz) {
                    return res.redirect(`/quiz/${courseSlug}/${matchingQuiz.moduleId}`);
                }
            }
            return res.redirect(`/quiz/${courseSlug}`);
        }

        const courses = await db.Course.findAll();
        res.render('quiz-courses', {
            title: 'Центр тестування | TechIndustry',
            courses,
            user: res.locals.user
        });
    } catch (e) {
        console.error('renderCourseSelection error:', e);
        res.status(500).send('Помилка завантаження курсів');
    }
};

exports.renderQuizList = async (req, res) => {
    try {
        const { slug } = req.params;
        const course = await db.Course.findOne({ where: { slug } });
        if (!course) return res.redirect('/quiz');
        const quizzes = readQuizFile(slug);
        res.render('quiz-list', {
            title: `Тести: ${course.title}`,
            quizzes: quizzes || [],
            courseSlug: slug,
            courseTitle: course.title,
            user: res.locals.user
        });
    } catch (e) {
        console.error('renderQuizList error:', e);
        res.status(500).send('Помилка завантаження списку тестів');
    }
};

exports.renderQuiz = async (req, res) => {
    try {
        const { slug, moduleId } = req.params;
        const quizzes = readQuizFile(slug);
        const quiz = quizzes?.find(q => q.moduleId === moduleId);
        if (!quiz) return res.redirect('/quiz/' + slug);
        const sanitizedQuiz = {
            ...quiz,
            questions: quiz.questions.map(q => {
                const { correctAnswer, expectedPattern, ...rest } = q;
                return rest;
            })
        };
        res.render('quiz-view', {
            title: quiz.title,
            quiz: sanitizedQuiz,
            courseSlug: slug,
            moduleId: moduleId
        });
    } catch (e) {
        console.error('renderQuiz error:', e);
        res.status(500).send('Помилка завантаження тесту');
    }
};

exports.submitQuiz = async (req, res) => {
    try {
        const { slug, moduleId } = req.params;
        const { answers } = req.body;
        const userId = req.userId;
        const quizzes = readQuizFile(slug);
        const quiz = quizzes?.find(q => q.moduleId === moduleId);
        if (!quiz) return res.status(404).json({ message: 'Тест не знайдено' });
        let correctCount = 0;
        const totalQuestions = quiz.questions.length;
        quiz.questions.forEach(q => {
            const userAnswer = answers[q.id];
            if (q.type === 'multiple' && Array.isArray(q.correctAnswer)) {
                if (Array.isArray(userAnswer) &&
                    userAnswer.length === q.correctAnswer.length &&
                    userAnswer.every(val => q.correctAnswer.includes(val))) {
                    correctCount++;
                }
            }
            else if (q.type === 'single') {
                if (Number(userAnswer) === Number(q.correctAnswer)) {
                    correctCount++;
                }
            }
            else if (q.type === 'code' && q.expectedPattern) {
                const regex = new RegExp(q.expectedPattern, 'm');
                if (regex.test(userAnswer)) {
                    correctCount++;
                }
            }
        });

        const percent = Math.round((correctCount / totalQuestions) * 100);
        const passed = percent >= quiz.passingScore;
        let gamificationResult = null;
        let isFirstCompletion = false;

        if (passed && userId) {
            const course = await db.Course.findOne({ where: { slug } });
            if (course) {
                let progress = await db.UserProgress.findOne({
                    where: { user_id: userId, course_id: course.id }
                });
                if (!progress) {
                    progress = await db.UserProgress.create({
                        user_id: userId,
                        course_id: course.id,
                        status: 'in_progress',
                        completed_lessons: [],
                        completed_quizzes: [],
                        started_at: new Date(),
                        last_accessed: new Date()
                    });
                }
                let completedQuizzes = progress.completed_quizzes;
                if (!Array.isArray(completedQuizzes)) {
                    completedQuizzes = [];
                }

                const quizIdentifier = `${slug}:${moduleId}`;
                console.log('Quiz check:', {
                    quizIdentifier,
                    completedQuizzes,
                    isIncluded: completedQuizzes.includes(quizIdentifier)
                });
                if (!completedQuizzes.includes(quizIdentifier)) {
                    isFirstCompletion = true;
                    completedQuizzes.push(quizIdentifier);
                    await db.UserProgress.update(
                        {
                            completed_quizzes: completedQuizzes,
                            last_accessed: new Date()
                        },
                        {
                            where: {
                                user_id: userId,
                                course_id: course.id
                            }
                        }
                    );
                    gamificationResult = await gamificationService.onQuizComplete(userId, percent);
                } else {
                }
            }
        }
        res.json({
            passed,
            percent,
            correctCount,
            totalQuestions,
            message: passed ? 'Вітаємо! Тест пройдено.' : 'Недостатньо балів для проходження.',
            gamification: isFirstCompletion ? gamificationResult : null,
            isRepeat: passed && !isFirstCompletion
        });
    } catch (error) {
        console.error("submitQuiz error:", error);
        res.status(500).json({ message: 'Помилка на сервері під час перевірки' });
    }
};