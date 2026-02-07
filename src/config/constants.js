module.exports = {
    AUTH: {
        COOKIE_OPTIONS: {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'development'
        },
        TOKEN_EXPIRY: '30d'
    },
    UPLOAD: {
        MAX_SIZE: 5 * 1024 * 1024,
        MIMETYPES: ['image/jpeg', 'image/png', 'image/webp']
    }
};