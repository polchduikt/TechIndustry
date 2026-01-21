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

db.Customer.hasOne(db.User, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
db.User.belongsTo(db.Customer, { foreignKey: 'customer_id' });

module.exports = db;