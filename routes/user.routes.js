const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const db = require('../models');
const User = db.user;

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      full_name,
      phone,
      address,
      farm_name,
      farm_location,
      description,
      profile_photo,
      organic_certified
    } = req.body;

    const updates = {
      full_name: full_name || user.full_name,
      phone: phone || user.phone,
      address: address || user.address
    };

    if (user.user_type === 'farmer') {
      Object.assign(updates, {
        farm_name: farm_name || user.farm_name,
        farm_location: farm_location || user.farm_location,
        description: description || user.description,
        profile_photo: profile_photo || user.profile_photo,
        organic_certified: organic_certified !== undefined ? organic_certified : user.organic_certified
      });
    }

    await user.update(updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...user.toJSON(),
        password: undefined
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findByPk(req.user.id);

    const validPassword = await bcrypt.compare(current_password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Get all farmers (public)
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await User.findAll({
      where: { user_type: 'farmer' },
      attributes: { 
        exclude: ['password', 'email', 'phone', 'address']
      }
    });

    res.json({
      success: true,
      farmers
    });
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmers'
    });
  }
});

// Get farmer details (public)
router.get('/farmers/:farmerId', async (req, res) => {
  try {
    const farmer = await User.findOne({
      where: {
        id: req.params.farmerId,
        user_type: 'farmer'
      },
      attributes: { 
        exclude: ['password', 'email', 'phone', 'address']
      }
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      farmer
    });
  } catch (error) {
    console.error('Error fetching farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmer'
    });
  }
});

// Admin routes
router.get('/all', [verifyToken, isAdmin], async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

module.exports = router; 