const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = req.cookies.token ||
            req.query.token ||
            (authHeader && authHeader.split(' ')[1]);
        if (!token) {
            return res.status(401).json({ message: 'Немає токену авторизації' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.userId || decoded.id || decoded;
        req.user = { id, username: decoded.username };
        req.userId = id;
        req.username = decoded.username;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Невалідний токен' });
    }
};

module.exports = auth;