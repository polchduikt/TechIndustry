const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Module = sequelize.define('Module', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING, allowNull: false },
        order: { type: DataTypes.INTEGER, defaultValue: 1 }
    });

    return Module;
};
