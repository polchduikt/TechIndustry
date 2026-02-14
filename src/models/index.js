const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// User models
db.Customer = require('./Customer')(sequelize);
db.User = require('./User')(sequelize);

// Course models
db.Course = require('./Course')(sequelize);
db.Module = require('./Module')(sequelize);
db.Lesson = require('./Lesson')(sequelize);
db.UserProgress = require('./UserProgress')(sequelize);
db.UserLevel = require('./UserLevel')(sequelize);

// Shop models
db.ShopCategory = require('./ShopCategory')(sequelize);
db.ShopItem = require('./ShopItem')(sequelize);
db.UserPurchase = require('./UserPurchase')(sequelize);
db.CoinTransaction = require('./CoinTransaction')(sequelize);

// User-Customer relationships
db.Customer.hasOne(db.User, {
    foreignKey: 'customer_id',
    onDelete: 'CASCADE'
});
db.User.belongsTo(db.Customer, {
    foreignKey: 'customer_id'
});

// Course relationships
db.Course.hasMany(db.Module, {
    foreignKey: 'course_id',
    as: 'modules',
    onDelete: 'CASCADE'
});
db.Module.belongsTo(db.Course, {
    foreignKey: 'course_id',
    as: 'course'
});

db.Module.hasMany(db.Lesson, {
    foreignKey: 'module_id',
    as: 'lessons',
    onDelete: 'CASCADE'
});
db.Lesson.belongsTo(db.Module, {
    foreignKey: 'module_id',
    as: 'module'
});

// Progress relationships
db.User.hasMany(db.UserProgress, {
    foreignKey: 'user_id',
    as: 'progress',
    onDelete: 'CASCADE'
});
db.UserProgress.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
});

db.Course.hasMany(db.UserProgress, {
    foreignKey: 'course_id',
    as: 'userProgress',
    onDelete: 'CASCADE'
});
db.UserProgress.belongsTo(db.Course, {
    foreignKey: 'course_id',
    as: 'course'
});

// Gamification relationships
db.User.hasOne(db.UserLevel, {
    foreignKey: 'user_id',
    as: 'levelData',
    onDelete: 'CASCADE'
});
db.UserLevel.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Shop relationships
db.ShopCategory.hasMany(db.ShopItem, {
    foreignKey: 'category_id',
    as: 'items',
    onDelete: 'CASCADE'
});
db.ShopItem.belongsTo(db.ShopCategory, {
    foreignKey: 'category_id',
    as: 'category'
});

db.User.hasMany(db.UserPurchase, {
    foreignKey: 'user_id',
    as: 'purchases',
    onDelete: 'CASCADE'
});
db.UserPurchase.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
});

db.ShopItem.hasMany(db.UserPurchase, {
    foreignKey: 'item_id',
    as: 'purchases',
    onDelete: 'CASCADE'
});
db.UserPurchase.belongsTo(db.ShopItem, {
    foreignKey: 'item_id',
    as: 'item'
});

db.User.hasMany(db.CoinTransaction, {
    foreignKey: 'user_id',
    as: 'transactions',
    onDelete: 'CASCADE'
});
db.CoinTransaction.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
});

module.exports = db;