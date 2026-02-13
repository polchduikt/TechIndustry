const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CoinTransaction = sequelize.define('CoinTransaction', {
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
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
            // positive for earning, negative for spending
        },
        transaction_type: {
            type: DataTypes.STRING(255),
            allowNull: false
            // 'lesson_complete', 'quiz_pass', 'purchase', 'refund', 'admin_grant', 'level_up', 'daily_bonus'
        },
        reference_id: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        balance_after: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'coin_transactions',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['created_at']
            },
            {
                fields: ['transaction_type']
            },
            {
                fields: ['user_id', 'created_at']
            },
            {
                fields: ['user_id', 'transaction_type']
            }
        ]
    });

    return CoinTransaction;
};