const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Course = sequelize.define('Course', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT
        },
        category: {
            type: DataTypes.STRING
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        thumbnail: {
            type: DataTypes.STRING
        },
        level: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            defaultValue: 'beginner'
        }
    }, {
        tableName: 'courses',
        underscored: true,
        timestamps: true,
        indexes: [
            {
                fields: ['slug']
            },
            {
                fields: ['category']
            },
            {
                fields: ['level']
            }
        ]
    });

    return Course;
};