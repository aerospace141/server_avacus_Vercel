const jwt = require('jsonwebtoken');
const { User } = require('../models/user'); // Assuming you have a User model
const jwtSecret = process.env.JWT_SECRET || 'anykey';
// const { check, validationResult } = require('express-validator');

const authenticateUser = async (req, res, next) => {

  const token = req.header('Authorization');

  // if (!token) {
  //   return res.status(401).json({ error: 'Authorization denied. No token provided.' });
  // }
  // if (token) {
  //       console.log(token) 
  //       }

  try {
    // const decoded = jwt.decode(token);
    const decoded = jwt.decode(token);


    req.userId = decoded.userId;
    req.ByPhoneNumber =  decoded.mobileNumber
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

module.exports = { authenticateUser };