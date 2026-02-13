const express = require('express');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const csrf = require('csurf');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();
const db = require('./src/models');
const userService = require('./src/services/userService');
const homeController = require('./src/controllers/homeController');
const userController = require('./src/controllers/userController');
const courseController = require('./src/controllers/courseController');
const quizController = require('./src/controllers/quizController');
const certificateController = require('./src/controllers/certificateController');
const leaderboardController = require('./src/controllers/leaderboardController');
const roadmapController = require('./src/controllers/roadmapController');
const { protectPage } = require('./src/middleware/pageAuth');
const shopRoutes = require('./src/routes/shopRoutes');
const shopController = require('./src/controllers/shopController');
const shopService = require('./src/services/shopService');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const progressRoutes = require('./src/routes/progressRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
const roadmapRoutes = require('./src/routes/roadmapRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

app.use(compression({
    level: 6,
    threshold: 10 * 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1y',
    etag: true,
    lastModified: true
}));
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
    maxAge: '1y',
    etag: true
}));

require('./src/helpers/avatarFrameHelper');

// Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            workerSrc: ["'self'", "blob:", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "https://ui-avatars.com", "https://www.google-analytics.com", "https://www.googletagmanager.com"],
            connectSrc: [
                "'self'",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com",
                "https://www.google-analytics.com",
                "https://analytics.google.com",
                "https://stats.g.doubleclick.net"
            ],
            frameSrc: ["'self'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Global Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Забагато запитів з цього IP',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { default: false },
    keyGenerator: (req) => {
        return req.ip ? req.ip.replace(/:\d+$/, '') : 'unknown';
    },
    handler: (req, res) => {
        res.status(429).json({ error: 'Забагато запитів. Спробуйте пізніше.' });
    }
});
app.use(globalLimiter);

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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: req.query,
        writable: true,
        configurable: true,
        enumerable: true
    });
    next();
});
app.use(mongoSanitize());

// Session configuration
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    },
    name: 'sessionId'
}));

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

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
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        } catch (e) {
            res.clearCookie('token');
        }
    }
    next();
});

// Public pages
app.get('/', homeController.renderIndex);
app.get('/courses', courseController.renderCourses);
app.get('/course/:slug', courseController.renderCourseDetail);
app.get('/about', (req, res) => res.render('about', { title: 'Про нас | TechIndustry' }));
app.get('/faq', (req, res) => res.render('faq', { title: 'FAQ | TechIndustry' }));
app.get('/roadmap', roadmapController.renderRoadmapSelection);
app.get('/roadmap/:id', roadmapController.renderRoadmapDetail);
app.get('/leaderboard', leaderboardController.renderLeaderboard);
app.get('/user/:username', leaderboardController.renderPublicProfile);
app.get('/gamification-info', userController.renderGamificationInfo);
app.get('/login', (req, res) => {
    res.render('login', { title: 'Вхід | TechIndustry' });
});
app.get('/sandbox', (req, res) => {
    res.render('sandbox', { title: 'Sandbox | TechIndustry' });
});
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Protected pages
app.get('/profile', protectPage, userController.renderProfile);
app.get('/settings', protectPage, userController.renderSettings);
app.get('/quiz/:slug/:moduleId', protectPage, quizController.renderQuiz);
app.get('/certificate', protectPage, certificateController.renderCertificate);
app.get('/certificate/:slug', protectPage, certificateController.renderCertificate);
app.get('/shop', protectPage, shopController.renderShop);
app.get('/inventory', protectPage, shopController.renderInventory);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/quiz', quizRoutes);
app.use('/shop', shopRoutes);
app.use('/api/shop', shopRoutes);

// CSRF Error Handler
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            error: 'Сесія застаріла або невалідний токен. Оновіть сторінку.'
        });
    }
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status);

    if (process.env.NODE_ENV === 'production') {
        res.json({ error: { message: 'Internal Server Error', status: status } });
    } else {
        res.json({ error: { message: err.message, status: status, stack: err.stack } });
    }
});

const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        await db.sequelize.sync({ alter: true });
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Server startup failed:', err);
        process.exit(1);
    }
};

startServer();