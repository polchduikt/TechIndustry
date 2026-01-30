const { User, Customer } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

class AuthService {
    async register(userData) {
        const { username, password, first_name, last_name, email, phone, birth_date, patronymic } = userData;

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) throw new Error('Username already taken');

        const existingCustomer = await Customer.findOne({
            where: { [Op.or]: [{ email }, { phone }] }
        });
        if (existingCustomer) throw new Error('User with this email or phone already exists');

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
            throw new Error('Invalid login or password');
        }

        return foundUser;
    }

    async requestPasswordReset(emailOrPhone) {
        const customer = await Customer.findOne({
            where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
        });

        if (!customer) {
            throw new Error('Користувача з такою поштою або телефоном не знайдено');
        }

        const user = await User.findOne({ where: { customer_id: customer.id } });
        if (!user) {
            throw new Error('Користувача не знайдено');
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({
            reset_code: resetCode,
            reset_code_expires: expiresAt
        });

        return { resetCode, email: customer.email, phone: customer.phone };
    }

    async verifyResetCode(emailOrPhone, code) {
        const customer = await Customer.findOne({
            where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
        });

        if (!customer) {
            throw new Error('Користувача не знайдено');
        }

        const user = await User.findOne({ where: { customer_id: customer.id } });
        if (!user) {
            throw new Error('Користувача не знайдено');
        }

        if (!user.reset_code || !user.reset_code_expires) {
            throw new Error('Код не був запитаний');
        }

        if (new Date() > user.reset_code_expires) {
            throw new Error('Код прострочений');
        }

        if (user.reset_code !== code) {
            throw new Error('Невірний код');
        }

        return user;
    }

    async resetPassword(emailOrPhone, code, newPassword) {
        const user = await this.verifyResetCode(emailOrPhone, code);

        user.password = newPassword;
        user.reset_code = null;
        user.reset_code_expires = null;
        await user.save();

        return true;
    }

    generateToken(userId, username) {
        return jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    }
}

module.exports = new AuthService();
