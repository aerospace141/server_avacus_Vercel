const express = require('express');
const router = express.Router();
const User = require('../../models/user'); // Assuming your User model is defined in this file
// const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'anykey';

const crypto = require('crypto');

const { authenticateUser } = require('../../middleware/authentication');

const generateDeviceId = () => {
  return crypto.randomBytes(32).toString('hex');
};


router.post('/login', async (req, res) => {
  try {
      const { mobileNumber, password, deviceFingerprint } = req.body;

      const user = await User.findOne({ mobileNumber });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // No hashing, just direct password comparison (⚠ Security Risk)
      if (password !== user.password) {
          return res.status(401).json({ message: 'Invalid password' });
      }

          // Generate new device ID for this session
        const newDeviceId = generateDeviceId();
        
        // Update user with new device ID (this invalidates previous sessions)
        await User.findOneAndUpdate(user.userId, {
        currentDeviceId: newDeviceId,
        lastLoginTime: new Date(),
        deviceFingerprint: deviceFingerprint
        });

      const token = jwt.sign({ userId: user.userId, deviceId: newDeviceId,  mobileNumber: user.mobileNumber }, jwtSecret, { expiresIn: '1h' });



      res.status(200).json({ message: 'Login successful', token,     deviceId: newDeviceId,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        hasActiveSubscription: user.hasActiveSubscription
      } 
    });
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Error during login' });
  }
});

router.get('/session-status', authenticateUser, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      mobileNumber: req.user.mobileNumber,
      hasActiveSubscription: req.user.hasActiveSubscription
    },
    deviceId: req.deviceId 
  });
});

// 6. UPDATED LOGOUT ENDPOINT
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // Clear the device ID to invalidate the session
    await User.findByIdAndUpdate(req.user._id, {
      currentDeviceId: null,
      deviceFingerprint: null
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. PROTECT YOUR EXISTING ROUTES
// Add the verifySingleDevice middleware to all your protected routes
// Example:
router.get('/user/profile', authenticateUser, async (req, res) => {
  try {
    const user = req.user; // User is already available from middleware
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      hasActiveSubscription: user.hasActiveSubscription
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/user/profile', authenticateUser, async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email, mobileNumber },
      { new: true }
    );

    res.json({
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      mobileNumber: updatedUser.mobileNumber,
      hasActiveSubscription: updatedUser.hasActiveSubscription
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 8. SUBSCRIPTION MANAGEMENT ENDPOINTS
router.post('/subscription/activate', authenticateUser, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      hasActiveSubscription: true
    });

    res.json({ message: 'Subscription activated successfully' });
  } catch (error) {
    console.error('Subscription activation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/subscription/deactivate', authenticateUser, async (req, res) => {
  try {
    // Deactivate subscription and clear device ID to force logout
    await User.findByIdAndUpdate(req.user._id, {
      hasActiveSubscription: false,
      currentDeviceId: null,
      deviceFingerprint: null
    });

    res.json({ 
      message: 'Subscription deactivated. You will be logged out.',
      forceLogout: true 
    });
  } catch (error) {
    console.error('Subscription deactivation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 9. ADMIN ENDPOINT TO CHECK ACTIVE SESSIONS (Optional)
router.get('/admin/active-sessions', async (req, res) => {
  try {
    // Only allow admin access - implement your admin authentication
    const activeSessions = await User.find({
      currentDeviceId: { $ne: null },
      hasActiveSubscription: true
    }).select('firstName lastName email mobileNumber lastLoginTime currentDeviceId');

    res.json({ activeSessions });
  } catch (error) {
    console.error('Active sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 10. FORCE LOGOUT ENDPOINT (Admin/System use)
router.post('/admin/force-logout/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await User.findByIdAndUpdate(userId, {
      currentDeviceId: null,
      deviceFingerprint: null
    });

    res.json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Force logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


  module.exports = router;