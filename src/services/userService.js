const { User, Customer } = require('../models');

class UserService {
    async getProfile(userId) {
        const user = await User.findByPk(userId, {
            include: [Customer],
            attributes: { exclude: ['password'] }
        });
        if (!user) throw new Error('Користувача не знайдено');
        return user;
    }

    async updateProfile(userId, profileData) {
        const user = await User.findByPk(userId, { include: [Customer] });
        if (!user) throw new Error('Користувача не знайдено');
        if (profileData.username && profileData.username !== user.username) {
            const exists = await User.findOne({ where: { username: profileData.username } });
            if (exists) throw new Error('Username зайнятий');
            await user.update({ username: profileData.username });
        }
        await user.Customer.update(profileData);
        return user;
    }

    async changePassword(userId, oldPassword, newPassword) {
        if (!newPassword || newPassword.length < 6) {
            throw new Error('Новий пароль має бути мінімум 6 символів');
        }
        const user = await User.findByPk(userId);
        if (!user) throw new Error('Користувача не знайдено');
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) throw new Error('Невірний старий пароль');
        user.password = newPassword;
        await user.save();
        return true;
    }

    async saveAvatar(userId, file) {
        if (!file) throw new Error('Файл не завантажено');
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const user = await User.findByPk(userId, { include: [Customer] });
        if (!user) throw new Error('Користувача не знайдено');
        await user.Customer.update({ avatar_data: base64Image });
        return base64Image;
    }
}

module.exports = new UserService();