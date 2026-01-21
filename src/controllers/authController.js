const jwt = require('jsonwebtoken');
const { User, Customer } = require('../models');
const { validationResult } = require('express-validator');

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

        const existingUser = await User.findOne({
            include: [{
                model: Customer,
                where: {
                    [require('sequelize').Op.or]: [
                        { email },
                        { phone }
                    ]
                },
                required: false
            }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Користувач з такою поштою або телефоном вже існує' });
        }

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username вже зайнятий' });
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

        res.json({ username: user.username });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
};