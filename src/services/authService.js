const { User, Customer } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

class AuthService {
    async register(userData) {
        const { username, password, first_name, last_name, email, phone, birth_date, patronymic } = userData;

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) throw new Error('Username вже зайнятий');

        const existingCustomer = await Customer.findOne({
            where: { [Op.or]: [{ email }, { phone }] }
        });
        if (existingCustomer) throw new Error('Користувач з такою поштою або телефоном вже існує');

        const birthDate = birth_date && birth_date.trim() !== '' ? birth_date : null;

        const customer = await Customer.create({
            first_name,
            last_name,
            email,
            phone,
            birth_date: birthDate,
            patronymic
        });
        const user = await User.create({ username, password, customer_id: customer.id });

        return user;
    }

    async login(login, password) {
        const user = await User.findOne({
            where: { username: login },
            include: [Customer]
        });

        let foundUser = user;
        if (!user) {
            const customer = await Customer.findOne({
                where: { [Op.or]: [{ email: login }, { phone: login }] }
            });
            if (customer) {
                foundUser = await User.findOne({ where: { customer_id: customer.id }, include: [Customer] });
            }
        }

        if (!foundUser || !(await foundUser.comparePassword(password))) {
            throw new Error('Невірний логін або пароль');
        }

        return foundUser;
    }

    generateToken(userId, username) {
        return jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    }
}

module.exports = new AuthService();