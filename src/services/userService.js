const { User, Customer } = require('../models');

class UserService {
    async getProfile(userId) {
        const user = await User.findByPk(userId, {
            include: [Customer],
            attributes: {exclude: ['password']}
        });

        if (!user) throw new Error('Користувача не знайдено');
        return user;
    }

    async updateProfile(userId, profileData) {
        const user = await User.findByPk(userId, {include: [Customer]});
        if (!user) throw new Error('Користувача не знайдено');
        let requiresReauth = false;
        if (profileData.username && profileData.username !== user.username) {
            const exists = await User.findOne({where: {username: profileData.username}});
            if (exists) throw new Error('Username зайнятий');
            await user.update({username: profileData.username});
            requiresReauth = true;
        }

        if (profileData.email && profileData.email !== user.Customer.email) {
            const existingEmail = await Customer.findOne({
                where: {email: profileData.email}
            });
            if (existingEmail && existingEmail.id !== user.Customer.id) {
                throw new Error('Email вже використовується');
            }
            requiresReauth = true;
        }

        if (profileData.phone && profileData.phone !== user.Customer.phone) {
            const existingPhone = await Customer.findOne({
                where: {phone: profileData.phone}
            });
            if (existingPhone && existingPhone.id !== user.Customer.id) {
                throw new Error('Телефон вже використовується');
            }
            requiresReauth = true;
        }

        const updateData = {...profileData};
        if (updateData.birth_date === '' || updateData.birth_date === null || updateData.birth_date === undefined) {
            updateData.birth_date = null;
        }
        await user.Customer.update(updateData);
        return {user, requiresReauth};
    }

    async changePassword(userId, oldPassword, newPassword) {
        if (!newPassword || newPassword.length < 8) {
            throw new Error('Новий пароль має бути мінімум 8 символів');
        }
        const user = await User.findByPk(userId);
        if (!user) throw new Error('Користувача не знайдено');
        if (user.auth_provider === 'google') {
            throw new Error('Для цього акаунта доступний лише вхід через Google');
        }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) throw new Error('Невірний старий пароль');
        user.password = newPassword;
        await user.save();
        return true;
    }

    async saveAvatar(userId, file) {
        if (!file) throw new Error('Файл не завантажено');
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const user = await User.findByPk(userId, {include: [Customer]});
        if (!user) throw new Error('Користувача не знайдено');
        await user.Customer.update({avatar_data: base64Image});
        return base64Image;
    }

    async deleteAvatar(userId) {
        const user = await User.findByPk(userId, {include: [Customer]});
        if (!user) throw new Error('Користувача не знайдено');
        await user.Customer.update({avatar_data: null, avatar_url: null});
        return true;
    }

    async updatePreferences(userId, preferences) {
        const user = await User.findByPk(userId, {include: [Customer]});
        if (!user) throw new Error('Користувача не знайдено');
        await user.Customer.update({
            hide_courses: preferences.hide_courses
        });
        return true;
    }
}

module.exports = new UserService();
