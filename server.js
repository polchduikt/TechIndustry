const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
require('dotenv').config();

const db = require('./src/models');
const userService = require('./src/services/userService');
const homeController = require('./src/controllers/homeController');
const userController = require('./src/controllers/userController');
const courseController = require('./src/controllers/courseController');
const quizController = require('./src/controllers/quizController');
const certificateController = require('./src/controllers/certificateController');
const roadmapController = require('./src/controllers/roadmapController');
const { protectPage } = require('./src/middleware/pageAuth');

const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const progressRoutes = require('./src/routes/progressRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
const roadmapRoutes = require('./src/routes/roadmapRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const getCourseIcon = require('./src/helpers/courseIconHelper');
hbs.registerHelper('getCourseIcon', getCourseIcon);
hbs.registerHelper('json', (context) => JSON.stringify(context));
hbs.registerHelper('add', (a, b) => a + b);
hbs.registerHelper('substring', (str, start, len) => str.substring(start, len));
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
        default: return options.inverse(this);
    }
});

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views/pages'));
hbs.registerPartials(path.join(__dirname, 'src/views/partials'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(async (req, res, next) => {
    const token = req.cookies.token;
    res.locals.user = null;
    res.locals.currentPath = req.path;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userService.getProfile(decoded.userId || decoded.id);
            res.locals.user = user;
            req.userId = user.id;
        } catch (e) {
            res.clearCookie('token');
        }
    }
    next();
});

app.get('/', homeController.renderIndex);
app.get('/profile', protectPage, userController.renderProfile);
app.get('/settings', protectPage, userController.renderSettings);
app.get('/courses', courseController.renderCourses);
app.get('/course/:slug', courseController.renderCourseDetail);
app.get('/quiz/:slug/:moduleId', protectPage, quizController.renderQuiz);
app.get('/certificate', protectPage, certificateController.renderCertificate);
app.get('/roadmap', roadmapController.renderRoadmapSelection);
app.get('/roadmap/:id', roadmapController.renderRoadmapDetail);

app.get('/login', (req, res) => res.render('login', { title: 'Вхід | TechIndustry' }));
app.get('/about', (req, res) => res.render('about', { title: 'Про нас | TechIndustry' }));
app.get('/faq', (req, res) => res.render('faq', { title: 'FAQ | TechIndustry' }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/quiz', quizRoutes);

app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status);

    if (process.env.NODE_ENV === 'production') {
        res.json({
            error: {
                message: 'Internal Server Error',
                status: status
            }
        });
    } else {
        res.json({
            error: {
                message: err.message,
                status: status,
                stack: err.stack
            }
        });
    }
});

const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        await db.sequelize.sync({ alter: true });
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    } catch (err) {
        process.exit(1);
    }
};

startServer();