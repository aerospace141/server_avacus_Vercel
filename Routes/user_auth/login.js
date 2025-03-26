const express = require('express');
const router = express.Router();
const User = require('../../models/user'); // Assuming your User model is defined in this file
// const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'anykey';

router.post('/login', async (req, res) => {
  try {
      const { mobileNumber, password } = req.body;

      const user = await User.findOne({ mobileNumber });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // No hashing, just direct password comparison (⚠ Security Risk)
      if (password !== user.password) {
          return res.status(401).json({ message: 'Invalid password' });
      }

      const token = jwt.sign({ userId: user.userId, mobileNumber: user.mobileNumber }, jwtSecret, { expiresIn: '1h' });

      res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Error during login' });
  }
});


  module.exports = router;