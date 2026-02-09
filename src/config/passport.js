const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, Customer } = require('../models');
const { Op } = require('sequelize');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id, { include: [Customer] });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const firstName = profile.name.givenName;
            const lastName = profile.name.familyName;

            // Перевіряємо чи існує користувач з таким email
            let customer = await Customer.findOne({ where: { email } });

            if (customer) {
                // Користувач вже існує - шукаємо його User запис
                const user = await User.findOne({
                    where: { customer_id: customer.id },
                    include: [Customer]
                });
                return done(null, user);
            }

            // Створюємо нового користувача
            const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 7);

            customer = await Customer.create({
                first_name: firstName,
                last_name: lastName || 'User',
                email: email,
                phone: '+380000000000', // Placeholder, можна буде оновити в налаштуваннях
                email_verified: true,
                patronymic: null,
                birth_date: null
            });

            const user = await User.create({
                username: username,
                password: Math.random().toString(36).substring(2, 15), // Рандомний пароль для OAuth користувачів
                customer_id: customer.id
            });

            const fullUser = await User.findByPk(user.id, { include: [Customer] });
            return done(null, fullUser);

        } catch (error) {
            return done(error, null);
        }
    }));

module.exports = passport;