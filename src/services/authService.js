const { User, Customer, UserProgress, UserLevel, sequelize } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const emailService = require('./emailService');

class AuthService {
    verificationCodes = new Map();
    async sendVerificationCode(email, firstName) {
        const isValidEmail = await emailService.verifyEmailExists(email);
        if (!isValidEmail) {
            throw new Error('Невалідна електронна адреса');
        }
        const existingCustomer = await Customer.findOne({ where: { email } });
        if (existingCustomer) {
            throw new Error('Користувач з такою поштою вже існує');
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        this.verificationCodes.set(email, {
            code,
            expiresAt,
            attempts: 0
        });
        await emailService.sendVerificationCode(email, code, firstName);
        return { codeSent: true, expiresIn: 600 };
    }

    async verifyEmailCode(email, code) {
        const storedData = this.verificationCodes.get(email);
        if (!storedData) {
            throw new Error('Код не знайдено. Запросіть новий код');
        }

        if (new Date() > storedData.expiresAt) {
            this.verificationCodes.delete(email);
            throw new Error('Код прострочений. Запросіть новий код');
        }

        if (storedData.attempts >= 5) {
            this.verificationCodes.delete(email);
            throw new Error('Перевищено кількість спроб. Запросіть новий код');
        }

        if (storedData.code !== code) {
            storedData.attempts++;
            throw new Error(`Невірний код. Залишилось спроб: ${5 - storedData.attempts}`);
        }

        this.verificationCodes.delete(email);
        return { verified: true };
    }

    async register(userData, emailVerified = false) {
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
            patronymic,
            email_verified: true
        });

        const user = await User.create({
            username,
            password,
            customer_id: customer.id
        });

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
                foundUser = await User.findOne({
                    where: { customer_id: customer.id },
                    include: [Customer]
                });
            }
        }
        if (!foundUser || !(await foundUser.comparePassword(password))) {
            throw new Error('Невірний логін або пароль');
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
        if (customer.email && customer.email === emailOrPhone) {
            await emailService.sendPasswordResetCode(
                customer.email,
                resetCode,
                customer.first_name
            );
        }
        return {
            resetCode,
            email: customer.email,
            phone: customer.phone,
            codeSent: true
        };
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

    async deleteAccount(userId) {
        const transaction = await sequelize.transaction();
        try {
            const user = await User.findByPk(userId, {
                include: [Customer],
                transaction
            });
            if (!user) {
                await transaction.rollback();
                throw new Error('Користувача не знайдено');
            }
            const customerId = user.customer_id;
            await UserProgress.destroy({
                where: { user_id: userId },
                transaction
            });
            await UserLevel.destroy({
                where: { user_id: userId },
                transaction
            });

            await user.destroy({ transaction });
            const customer = await Customer.findByPk(customerId, { transaction });
            if (customer) {
                await customer.destroy({ transaction });
            }
            await transaction.commit();
            return true;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    generateToken(userId, username) {
        return jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    }
}

module.exports = new AuthService();