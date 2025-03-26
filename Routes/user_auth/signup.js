const express = require('express');
const router = express.Router();
const User = require('../../models/user'); // Assuming your User model is defined in this file
// const bcrypt = require('bcryptjs');
// const { authenticateUser } = require('../middleware/authentication');

router.post('/signup', async (req, res) => {
  try {
      const { firstName, lastName, email, mobileNumber, password, userId } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ mobileNumber });
      if (existingUser) {
          return res.status(400).json({ message: 'User with this MobileNumber already exists' });
      }

      // Save password in plain text (⚠ Security Risk)
      const newUser = new User({ firstName, lastName, email, mobileNumber, password, userId });

      await newUser.save();

      res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
  
module.exports = router;