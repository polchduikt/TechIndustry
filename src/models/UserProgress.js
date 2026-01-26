const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserProgress = sequelize.define('UserProgress', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        status: { 
            type: DataTypes.ENUM('not_started', 'in_progress', 'completed'), 
            defaultValue: 'not_started' 
        },
        score: { type: DataTypes.INTEGER, defaultValue: 0 },
        last_accessed: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    return UserProgress;
};
