module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("order", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customer_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    total_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending'
    },
    delivery_address: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    payment_status: {
      type: Sequelize.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    payment_method: {
      type: Sequelize.STRING(50),
      allowNull: false
    }
  });

  const OrderItem = sequelize.define("order_item", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    product_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    price_per_unit: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    total_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    }
  });

  Order.hasMany(OrderItem, { foreignKey: 'order_id' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

  return { Order, OrderItem };
}; 