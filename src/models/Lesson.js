const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Lesson = sequelize.define('Lesson', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        type: {
            type: DataTypes.ENUM('text', 'quiz', 'video'),
            defaultValue: 'text'
        },
        content_path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        module_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'lessons',
        underscored: true,
        timestamps: true,
        indexes: [
            {
                fields: ['module_id']
            },
            {
                fields: ['order']
            },
            {
                fields: ['module_id', 'order']
            },
            {
                fields: ['type']
            }
        ]
    });

    return Lesson;
};