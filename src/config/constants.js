module.exports = {
    AUTH: {
        COOKIE_OPTIONS: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/'
        },
        TOKEN_EXPIRY: '30d',

        MAX_LOGIN_ATTEMPTS: 5,
        LOGIN_ATTEMPTS_WINDOW: 15 * 60 * 1000,
        MAX_VERIFICATION_ATTEMPTS: 5,
        VERIFICATION_CODE_EXPIRY: 10 * 60 * 1000,
        PASSWORD_RESET_CODE_EXPIRY: 10 * 60 * 1000,
        MIN_PASSWORD_LENGTH: 8
    },

    UPLOAD: {
        MAX_SIZE: 5 * 1024 * 1024,
        ALLOWED_MIMETYPES: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif'
        ],
        BLOCKED_EXTENSIONS: [
            '.exe',
            '.bat',
            '.sh',
            '.php',
            '.js',
            '.html'
        ]
    },

    RATE_LIMITS: {
        GLOBAL: {
            windowMs: 15 * 60 * 1000,
            max: 100
        },
        LOGIN: {
            windowMs: 15 * 60 * 1000,
            max: 5,
            message: 'Забагато спроб входу. Спробуйте через 15 хвилин'
        },
        REGISTER: {
            windowMs: 60 * 60 * 1000,
            max: 3,
            message: 'Забагато спроб реєстрації. Спробуйте через годину'
        },
        EMAIL_VERIFICATION: {
            windowMs: 60 * 60 * 1000,
            max: 10,
            message: 'Забагато запитів на верифікацію'
        },
        PASSWORD_RESET: {
            windowMs: 60 * 60 * 1000,
            max: 3,
            message: 'Забагато спроб відновлення паролю'
        },
        QUIZ_SUBMIT: {
            windowMs: 60 * 1000,
            max: 10,
            message: 'Забагато спроб надіслати тест'
        },
        API: {
            windowMs: 60 * 1000,
            max: 30,
            message: 'Забагато API запитів'
        }
    },

    SECURITY: {
        MAX_INPUT_LENGTH: {
            username: 50,
            email: 255,
            name: 100,
            phone: 20,
            password: 128,
            code: 6
        },
        PATTERNS: {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^\+380\d{9}$/,
            username: /^[a-zA-Z0-9._-]{3,50}$/,
            noHTML: /^[^<>]*$/
        },
        BLOCKED_USERNAMES: [
            'admin',
            'administrator',
            'root',
            'superuser',
            'moderator',
            'support',
            'techindustry',
            'system'
        ]
    },

    VALIDATION: {
        ALLOWED_EMAIL_DOMAINS: [
            'gmail.com',
            'ukr.net',
            'i.ua',
            'meta.ua',
            'outlook.com',
            'yahoo.com',
            'icloud.com',
            'proton.me'
        ],
        MIN_AGE: 13
    }
};