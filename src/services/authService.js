const { User, Customer, UserProgress, UserLevel, sequelize } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
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
        const normalizedEmail = email.toLowerCase().trim(); // ДОДАНО
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            throw new Error('Невалідна електронна адреса');
        }

        const isValidEmail = await emailService.verifyEmailExists(normalizedEmail);
        if (!isValidEmail) {
            throw new Error('Невалідна електронна адреса');
        }

        const existingCustomer = await Customer.findOne({ where: { email: normalizedEmail } });
        if (existingCustomer) {
            throw new Error('Користувач з такою поштою вже існує');
        }

        const code = this.generateSecureCode();
        const hashedCode = this.hashCode(code);
        const expiresAt = new Date(Date.now() + AUTH.VERIFICATION_CODE_EXPIRY);

        this.verificationCodes.set(normalizedEmail, {
            hashedCode,
            expiresAt,
            attempts: 0
        });

        await emailService.sendVerificationCode(normalizedEmail, code, firstName);
        return { codeSent: true, expiresIn: 600 };
    }

    async verifyEmailCode(email, code) {
        const normalizedEmail = email.toLowerCase().trim();
        const storedData = this.verificationCodes.get(normalizedEmail);

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

        this.verificationCodes.delete(normalizedEmail);
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
            auth_provider: 'local',
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

        if (!foundUser) {
            throw new Error('Невірний логін або пароль');
        }

        if (foundUser.auth_provider === 'google') {
            throw new Error('Цей акаунт створено через Google. Увійдіть через Google.');
        }

        if (!(await foundUser.comparePassword(password))) {
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

        if (user.auth_provider === 'google') {
            throw new Error('Для цього акаунта доступний лише вхід через Google');
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

    getGoogleAuthUrl(state) {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CALLBACK_URL) {
            throw new Error('Google OAuth is not configured');
        }

        const params = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            redirect_uri: process.env.GOOGLE_CALLBACK_URL,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'select_account',
            state
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async exchangeGoogleCode(code) {
        if (!code) {
            throw new Error('Google authorization code is missing');
        }

        const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_CALLBACK_URL,
                grant_type: 'authorization_code'
            }).toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 10000
            }
        );

        const { access_token: accessToken } = tokenResponse.data || {};
        if (!accessToken) {
            throw new Error('Failed to get Google access token');
        }

        const userInfoResponse = await axios.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                timeout: 10000
            }
        );

        return userInfoResponse.data || {};
    }

    async ensureGoogleUser(googleProfile) {
        const email = (googleProfile.email || '').toLowerCase().trim();
        if (!email) {
            throw new Error('Google account does not provide email');
        }

        const firstName = (googleProfile.given_name || 'Google').trim();
        const lastName = (googleProfile.family_name || 'User').trim();
        const avatarUrl = googleProfile.picture || null;

        const customer = await Customer.findOne({ where: { email } });
        if (customer) {
            const existingUser = await User.findOne({ where: { customer_id: customer.id } });
            if (existingUser) {
                return { user: existingUser, isNew: false };
            }

            const username = await this.generateUniqueUsername(email);
            const password = crypto.randomBytes(32).toString('hex');
            const user = await User.create({
                username,
                password,
                auth_provider: 'google',
                customer_id: customer.id
            });

            return { user, isNew: true };
        }

        const username = await this.generateUniqueUsername(email);
        const phone = await this.generateUniqueGooglePhone();
        const password = crypto.randomBytes(32).toString('hex');

        const transaction = await sequelize.transaction();
        try {
            const newCustomer = await Customer.create(
                {
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    phone,
                    avatar_url: avatarUrl,
                    email_verified: true
                },
                { transaction }
            );

            const user = await User.create(
                {
                    username,
                    password,
                    auth_provider: 'google',
                    customer_id: newCustomer.id
                },
                { transaction }
            );

            await transaction.commit();
            return { user, isNew: true };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async generateUniqueUsername(email) {
        const localPart = (email.split('@')[0] || 'google_user').toLowerCase();
        const sanitized = localPart
            .replace(/[^a-z0-9._-]/g, '')
            .replace(/^[._-]+/, '')
            .slice(0, 30);
        const base = sanitized.length >= 3 ? sanitized : 'google_user';

        let candidate = base;
        let suffix = 1;

        while (await User.findOne({ where: { username: candidate } })) {
            const next = `${base}_${suffix}`;
            candidate = next.slice(0, 50);
            suffix += 1;
        }

        return candidate;
    }

    async generateUniqueGooglePhone() {
        for (let i = 0; i < 20; i++) {
            const phone = `+99${crypto.randomInt(1000000000, 9999999999)}`;
            const exists = await Customer.findOne({ where: { phone } });
            if (!exists) {
                return phone;
            }
        }

        throw new Error('Unable to generate unique phone');
    }
}

module.exports = new AuthService();
