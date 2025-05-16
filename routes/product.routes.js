const express = require('express');
const router = express.Router();
const { verifyToken, isFarmer } = require('../middleware/auth.middleware');
const { validateProduct } = require('../middleware/validation.middleware');
const db = require('../models');
const Product = db.product;
const Category = db.category;

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: db.user,
          attributes: ['full_name', 'farm_name', 'farm_location']
        },
        {
          model: db.category,
          attributes: ['name']
        }
      ]
    });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { category_id: req.params.categoryId },
      include: [
        {
          model: db.user,
          attributes: ['full_name', 'farm_name', 'farm_location']
        },
        {
          model: db.category,
          attributes: ['name']
        }
      ]
    });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get farmer's products
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { farmer_id: req.params.farmerId },
      include: [
        {
          model: db.category,
          attributes: ['name']
        }
      ]
    });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Add new product (farmer only)
router.post('/', [verifyToken, isFarmer, validateProduct], async (req, res) => {
  try {
    const { name, description, price, unit, category_id, stock, image } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price,
      unit,
      stock,
      image,
      category_id,
      farmer_id: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product'
    });
  }
});

// Update product (farmer only)
router.put('/:productId', [verifyToken, isFarmer], async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.productId,
        farmer_id: req.user.id
      }
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized'
      });
    }
    
    const { name, description, price, unit, category_id, stock, image } = req.body;
    
    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      unit: unit || product.unit,
      stock: stock !== undefined ? stock : product.stock,
      image: image || product.image,
      category_id: category_id || product.category_id
    });
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product (farmer only)
router.delete('/:productId', [verifyToken, isFarmer], async (req, res) => {
  try {
    const result = await Product.destroy({
      where: {
        id: req.params.productId,
        farmer_id: req.user.id
      }
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

module.exports = router; 