const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ShopItem = sequelize.define('ShopItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'shop_categories',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        item_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            // 'avatar_frame', 'title_badge', 'course_unlock', 'profile_theme'
        },
        item_value: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        rarity: {
            type: DataTypes.STRING(20),
            defaultValue: 'common',
            // 'common', 'rare', 'epic', 'legendary'
        },
        preview_image: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        level_required: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        limited_quantity: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'shop_items',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['item_type', 'item_value']
            },
            {
                fields: ['category_id']
            },
            {
                fields: ['is_available']
            },
            {
                fields: ['level_required']
            },
            {
                fields: ['display_order']
            },
            {
                fields: ['rarity']
            },
            {
                fields: ['category_id', 'is_available']
            },
            {
                fields: ['is_available', 'level_required']
            }
        ]
    });

    return ShopItem;
};