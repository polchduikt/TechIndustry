const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ShopCategory = sequelize.define('ShopCategory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        slug: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        icon: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'shop_categories',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['slug']
            },
            {
                fields: ['is_active']
            },
            {
                fields: ['display_order']
            },
            {
                fields: ['is_active', 'display_order']
            }
        ]
    });

    return ShopCategory;
};