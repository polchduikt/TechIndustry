const userService = require('../services/userService');
const { validationResult } = require('express-validator');

exports.getProfile = async (req, res) => {
    try {
        const user = await userService.getProfile(req.userId);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const result = await userService.updateProfile(req.userId, req.body);

        if (result.requiresReauth) {
            res.clearCookie('token');
            return res.json({
                message: 'Профіль оновлено. Потрібна повторна авторизація',
                requiresReauth: true
            });
        }

        res.json({
            message: 'Профіль оновлено',
            username: result.user.username,
            requiresReauth: false
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        await userService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
        res.clearCookie('token');
        res.json({
            message: 'Пароль успішно змінено. Потрібна повторна авторизація',
            requiresReauth: true
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        const avatarUrl = await userService.saveAvatar(req.userId, req.file);
        res.json({ message: 'Аватар успішно оновлено', avatarUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAvatar = async (req, res) => {
    try {
        await userService.deleteAvatar(req.userId);
        res.json({ message: 'Аватар видалено' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};