const express = require('express');
const router = express.Router();
const { verifyToken, isCustomer, isFarmer } = require('../middleware/auth.middleware');
const { validateOrder } = require('../middleware/validation.middleware');
const db = require('../models');
const Order = db.order.Order;
const OrderItem = db.order.OrderItem;
const Product = db.product;
const { sequelize } = db;

// Create new order (customer only)
router.post('/', [verifyToken, isCustomer, validateOrder], async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { items, delivery_address, payment_method } = req.body;
    let total_amount = 0;

    // Calculate total and verify stock
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product_id} not found`
        });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`
        });
      }

      total_amount += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      customer_id: req.user.id,
      total_amount,
      delivery_address,
      payment_method,
      status: 'pending',
      payment_status: 'pending'
    }, { transaction: t });

    // Create order items and update stock
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_unit: product.price,
        total_price: product.price * item.quantity
      }, { transaction: t });

      // Update product stock
      await product.update({
        stock: product.stock - item.quantity
      }, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        ...order.toJSON(),
        items: items
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Get customer's orders
router.get('/customer', [verifyToken, isCustomer], async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customer_id: req.user.id },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['name', 'image', 'unit']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get farmer's orders
router.get('/farmer', [verifyToken, isFarmer], async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              where: { farmer_id: req.user.id },
              attributes: ['name', 'image', 'unit']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Update order status (farmer only)
router.put('/:orderId/status', [verifyToken, isFarmer], async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.orderId;

    if (!['confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              where: { farmer_id: req.user.id }
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized'
      });
    }

    await order.update({ status });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

module.exports = router; 