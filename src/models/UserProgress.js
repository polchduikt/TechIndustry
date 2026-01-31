const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserProgress = sequelize.define('UserProgress', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
            defaultValue: 'not_started'
        },
        score: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        completed_lessons: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        last_accessed: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        started_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'user_progress',
        timestamps: true,
        underscored: true
    });

    return UserProgress;
};
