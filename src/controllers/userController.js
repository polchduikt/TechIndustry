const userService = require('../services/userService');

exports.getProfile = async (req, res) => {
    try {
        const user = await userService.getProfile(req.userId);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await userService.updateProfile(req.userId, req.body);
        res.json({ message: 'Профіль оновлено', username: user.username });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        await userService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
        res.json({ message: 'Пароль успішно змінено' });
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