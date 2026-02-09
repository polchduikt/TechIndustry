const { User, Customer, UserProgress, UserLevel, sequelize } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('./emailService');
const { AUTH } = require('../config/constants');

class AuthService {
    constructor() {
        this.verificationCodes = new Map();
        this.loginAttempts = new Map();
    }

    generateSecureCode() {
        return crypto.randomInt(100000, 999999).toString();
    }

    hashCode(code) {
        return crypto.createHash('sha256').update(code).digest('hex');
    }

    checkLoginAttempts(identifier) {
        const attempts = this.loginAttempts.get(identifier);
        if (!attempts) {
            this.loginAttempts.set(identifier, {
                count: 1,
                firstAttempt: Date.now()
            });
            return true;
        }

        const timePassed = Date.now() - attempts.firstAttempt;
        if (timePassed > AUTH.LOGIN_ATTEMPTS_WINDOW) {
            this.loginAttempts.delete(identifier);
            return true;
        }

        if (attempts.count >= AUTH.MAX_LOGIN_ATTEMPTS) {
            const remaining = Math.ceil((AUTH.LOGIN_ATTEMPTS_WINDOW - timePassed) / 60000);
            throw new Error(`Забагато спроб входу. Спробуйте через ${remaining} хв`);
        }

        attempts.count++;
        return true;
    }

    resetLoginAttempts(identifier) {
        this.loginAttempts.delete(identifier);
    }

    async sendVerificationCode(email, firstName) {
        const isValidEmail = await emailService.verifyEmailExists(email);
        if (!isValidEmail) {
            throw new Error('Невалідна електронна адреса');
        }

        const existingCustomer = await Customer.findOne({ where: { email } });
        if (existingCustomer) {
            throw new Error('Невалідна електронна адреса');
        }

        const code = this.generateSecureCode();
        const hashedCode = this.hashCode(code);
        const expiresAt = new Date(Date.now() + AUTH.VERIFICATION_CODE_EXPIRY);
        this.verificationCodes.set(email, {
            hashedCode,
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

        if (storedData.attempts >= AUTH.MAX_VERIFICATION_ATTEMPTS) {
            this.verificationCodes.delete(email);
            throw new Error('Перевищено кількість спроб. Запросіть новий код');
        }

        const hashedInputCode = this.hashCode(code);

        if (storedData.hashedCode !== hashedInputCode) {
            storedData.attempts++;
            throw new Error(`Невірний код. Залишилось спроб: ${AUTH.MAX_VERIFICATION_ATTEMPTS - storedData.attempts}`);
        }

        this.verificationCodes.delete(email);
        return { verified: true };
    }

    async register(userData, emailVerified = false) {
        const { username, password, first_name, last_name, email, phone, birth_date, patronymic } = userData;
        if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
            throw new Error('Username має містити тільки літери, цифри, крапку, підкреслення або дефіс (3-50 символів)');
        }

        if (AUTH.SECURITY?.BLOCKED_USERNAMES?.includes(username.toLowerCase())) {
            throw new Error('Цей username заборонений');
        }

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) throw new Error('Username вже зайнятий');
        const existingCustomer = await Customer.findOne({
            where: { [Op.or]: [{ email }, { phone }] }
        });
        if (existingCustomer) throw new Error('Користувач з такою поштою або телефоном вже існує');
        if (password.length < AUTH.MIN_PASSWORD_LENGTH) {
            throw new Error(`Пароль має бути мінімум ${AUTH.MIN_PASSWORD_LENGTH} символів`);
        }
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
        this.checkLoginAttempts(login);
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
        this.resetLoginAttempts(login);
        return foundUser;
    }

    async requestPasswordReset(emailOrPhone) {
        const customer = await Customer.findOne({
            where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
        });

        if (!customer) {
            return {
                codeSent: true,
                message: 'Якщо цей email існує, ми надіслали код'
            };
        }

        const user = await User.findOne({ where: { customer_id: customer.id } });
        if (!user) {
            return {
                codeSent: true,
                message: 'Якщо цей email існує, ми надіслали код'
            };
        }

        const resetCode = this.generateSecureCode();
        const hashedCode = this.hashCode(resetCode);
        const expiresAt = new Date(Date.now() + AUTH.PASSWORD_RESET_CODE_EXPIRY);
        await user.update({
            reset_code: hashedCode,
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
            codeSent: true,
            message: 'Якщо цей email існує, ми надіслали код'
        };
    }

    async verifyResetCode(emailOrPhone, code) {
        const customer = await Customer.findOne({
            where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
        });

        if (!customer) {
            throw new Error('Невірний код');
        }

        const user = await User.findOne({ where: { customer_id: customer.id } });
        if (!user) {
            throw new Error('Невірний код');
        }

        if (!user.reset_code || !user.reset_code_expires) {
            throw new Error('Код не був запитаний');
        }

        if (new Date() > user.reset_code_expires) {
            throw new Error('Код прострочений');
        }

        const hashedInputCode = this.hashCode(code);

        if (user.reset_code !== hashedInputCode) {
            throw new Error('Невірний код');
        }

        return user;
    }

    async resetPassword(emailOrPhone, code, newPassword) {
        if (newPassword.length < AUTH.MIN_PASSWORD_LENGTH) {
            throw new Error(`Пароль має бути мінімум ${AUTH.MIN_PASSWORD_LENGTH} символів`);
        }
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
        return jwt.sign(
            { userId, username },
            process.env.JWT_SECRET,
            { expiresIn: AUTH.TOKEN_EXPIRY }
        );
    }
}

module.exports = new AuthService();