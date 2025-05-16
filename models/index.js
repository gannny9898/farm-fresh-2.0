const { Sequelize } = require('sequelize');
const config = require('../config/db.config.js');

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model.js')(sequelize, Sequelize);
db.product = require('./product.model.js')(sequelize, Sequelize);
db.order = require('./order.model.js')(sequelize, Sequelize);
db.category = require('./category.model.js')(sequelize, Sequelize);

// Define relationships
db.user.hasMany(db.product, { foreignKey: 'farmer_id' });
db.product.belongsTo(db.user, { foreignKey: 'farmer_id' });

db.user.hasMany(db.order, { foreignKey: 'customer_id' });
db.order.belongsTo(db.user, { foreignKey: 'customer_id' });

db.product.belongsTo(db.category, { foreignKey: 'category_id' });
db.category.hasMany(db.product, { foreignKey: 'category_id' });

module.exports = db; 