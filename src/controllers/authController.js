const authService = require('../services/authService');
const userService = require('../services/userService');
const { AUTH } = require('../config/constants');

exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);

        if (req.file) {
            await userService.saveAvatar(user.id, req.file);
        }

        const token = authService.generateToken(user.id, user.username);
        res.cookie('token', token, AUTH.COOKIE_OPTIONS);
        res.status(201).json({ message: 'Реєстрація успішна', username: user.username });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await authService.login(req.body.login, req.body.password);
        const token = authService.generateToken(user.id, user.username);
        res.cookie('token', token, AUTH.COOKIE_OPTIONS);
        res.json({ message: 'Авторизація успішна', username: user.username });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Вихід успішний' });
};