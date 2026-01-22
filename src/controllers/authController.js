const jwt = require('jsonwebtoken');
const { User, Customer } = require('../models');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

const generateToken = (userId, username) => {
    return jwt.sign(
        { userId, username },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            username,
            password,
            first_name,
            last_name,
            patronymic,
            birth_date,
            email,
            phone
        } = req.body;

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username вже зайнятий' });
        }

        const existingCustomer = await Customer.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { email },
                    { phone }
                ]
            }
        });

        if (existingCustomer) {
            return res.status(400).json({ message: 'Користувач з такою поштою або телефоном вже існує' });
        }

        const customer = await Customer.create({
            first_name,
            last_name,
            patronymic,
            birth_date,
            email,
            phone
        });

        const user = await User.create({
            username,
            password,
            customer_id: customer.id
        });

        const token = generateToken(user.id, user.username);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({
            message: 'Реєстрація успішна',
            username: user.username
        });

    } catch (error) {
        console.error('Помилка реєстрації:', error);
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;

        const user = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { username: login }
                ]
            },
            include: [{
                model: Customer,
                where: {
                    [require('sequelize').Op.or]: [
                        { email: login },
                        { phone: login }
                    ]
                },
                required: false
            }]
        });

        let foundUser = user;
        if (!user) {
            const customer = await Customer.findOne({
                where: {
                    [require('sequelize').Op.or]: [
                        { email: login },
                        { phone: login }
                    ]
                }
            });

            if (customer) {
                foundUser = await User.findOne({
                    where: { customer_id: customer.id },
                    include: [Customer]
                });
            }
        }

        if (!foundUser) {
            return res.status(401).json({ message: 'Невірний логін або пароль' });
        }

        const isPasswordValid = await foundUser.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Невірний логін або пароль' });
        }

        const token = generateToken(foundUser.id, foundUser.username);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production'
        });

        res.json({
            message: 'Авторизація успішна',
            username: foundUser.username
        });

    } catch (error) {
        console.error('Помилка авторизації:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.setHeader('Cache-Control', 'no-store');
    res.json({ message: 'Вихід успішний' });
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: [Customer],
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }

        res.json({
            username: user.username,
            Customer: user.Customer
        });
    } catch (error) {
        console.error('Помилка отримання профілю:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, first_name, last_name, patronymic, email, phone, birth_date } = req.body;

        const user = await User.findByPk(req.userId, { include: [Customer] });
        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username вже зайнятий' });
            }
        }

        if (email && email !== user.Customer.email) {
            const existingCustomer = await Customer.findOne({ where: { email } });
            if (existingCustomer) {
                return res.status(400).json({ message: 'Email вже використовується' });
            }
        }

        if (phone && phone !== user.Customer.phone) {
            const existingCustomer = await Customer.findOne({ where: { phone } });
            if (existingCustomer) {
                return res.status(400).json({ message: 'Телефон вже використовується' });
            }
        }

        if (username) {
            await user.update({ username });
        }

        await user.Customer.update({
            first_name,
            last_name,
            patronymic,
            email,
            phone,
            birth_date
        });

        res.json({
            message: 'Профіль успішно оновлено',
            username: user.username
        });
    } catch (error) {
        console.error('Помилка оновлення профілю:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Всі поля обов\'язкові' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Новий пароль має бути мінімум 6 символів' });
        }

        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Невірний старий пароль' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Пароль успішно змінено' });
    } catch (error) {
        console.error('Помилка зміни пароля:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Файл не завантажено' });

        const user = await User.findByPk(req.userId, { include: [Customer] });
        if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        await user.Customer.update({ avatar_data: base64Image });

        res.json({
            message: 'Аватар успішно оновлено',
            avatarUrl: base64Image
        });
    } catch (error) {
        res.status(500).json({ message: 'Помилка завантаження' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: [Customer],
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

        res.json({
            username: user.username,
            Customer: user.Customer
        });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
};