const jwt = require('jsonwebtoken');

const protectPage = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

const redirectIfAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect('/profile');
        } catch (e) {
            res.clearCookie('token');
        }
    }
    next();
};

module.exports = { protectPage, redirectIfAuth };