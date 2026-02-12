const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserPurchase = sequelize.define('UserPurchase', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'shop_items',
                key: 'id'
            }
        },
        price_paid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        purchased_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        is_equipped: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'user_purchases',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'item_id']
            }
        ]
    });

    return UserPurchase;
};