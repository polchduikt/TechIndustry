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
        logging: false
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Customer = require('./Customer')(sequelize);
db.User = require('./User')(sequelize);
db.Course = require('./Course')(sequelize);
db.Module = require('./Module')(sequelize);
db.Lesson = require('./Lesson')(sequelize);
db.UserProgress = require('./UserProgress')(sequelize);

db.Customer.hasOne(db.User, {
    foreignKey: 'customer_id',
    onDelete: 'CASCADE'
});
db.User.belongsTo(db.Customer, {
    foreignKey: 'customer_id'
});

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

module.exports = db;
