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
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null
        },
        avatar_data: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null
        }
    }, {
        tableName: 'customers',
        timestamps: true
    });

    return Customer;
};