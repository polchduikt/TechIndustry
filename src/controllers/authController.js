const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const userService = require('../services/userService');
const { AUTH } = require('../config/constants');

exports.requestEmailVerification = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        const { email, first_name } = req.body;
        const result = await authService.sendVerificationCode(email, first_name);
        res.json({
            message: 'Код верифікації надіслано на вашу пошту',
            ...result
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.verifyEmailCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const result = await authService.verifyEmailCode(email, code);
        res.json({
            message: 'Email успішно підтверджено',
            ...result
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        const { emailVerified } = req.body;
        const user = await authService.register(req.body, emailVerified === 'true');
        if (req.file) {
            await userService.saveAvatar(user.id, req.file);
        }
        const token = authService.generateToken(user.id, user.username);
        res.cookie('token', token, AUTH.COOKIE_OPTIONS);
        res.status(201).json({
            message: 'Реєстрація успішна',
            username: user.username,
            token: token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        const user = await authService.login(req.body.login, req.body.password);
        const token = authService.generateToken(user.id, user.username);
        res.cookie('token', token, AUTH.COOKIE_OPTIONS);
        res.json({
            message: 'Авторизація успішна',
            username: user.username,
            token: token
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.json({ message: 'Вихід успішний', redirect: '/' });
    });
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { emailOrPhone } = req.body;
        const result = await authService.requestPasswordReset(emailOrPhone);
        res.json({
            message: 'Код відновлення надіслано на вашу пошту',
            codeSent: true
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.verifyResetCode = async (req, res) => {
    try {
        const { emailOrPhone, code } = req.body;
        await authService.verifyResetCode(emailOrPhone, code);
        res.json({ message: 'Код підтверджено', verified: true });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        const { emailOrPhone, code, newPassword } = req.body;
        await authService.resetPassword(emailOrPhone, code, newPassword);
        res.json({ message: 'Пароль успішно змінено', success: true });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { confirmation } = req.body;
        if (confirmation !== 'ВИДАЛИТИ') {
            return res.status(400).json({ message: 'Невірне підтвердження' });
        }
        await authService.deleteAccount(req.userId);
        res.clearCookie('token');
        req.session.destroy();
        res.json({ message: 'Акаунт видалено', redirect: '/' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};