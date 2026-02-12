const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Customer = sequelize.define('Customer', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        patronymic: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        birth_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        avatar_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null
        },
        avatar_data: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        hide_courses: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        avatar_frame: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null
        },
        title_badge: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        profile_theme: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'default'
        }
    }, {
        tableName: 'customers',
        timestamps: true
    });

    return Customer;
};