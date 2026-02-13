const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserLevel = sequelize.define('UserLevel', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        experience: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        badges: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        coins: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
    }, {
        tableName: 'user_levels',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['user_id']
            },
            {
                fields: ['level']
            },
            {
                fields: ['experience']
            },
            {
                fields: ['coins']
            },
            {
                fields: ['level', 'experience']
            }
        ]
    });

    return UserLevel;
};