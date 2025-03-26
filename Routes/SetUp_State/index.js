// Routes - Performance
const express = require('express');
const router = express.Router();
const Performance = require('../../models/Performance'); // Assuming your User model is defined in this file
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const jwtSecret = process.env.JWT_SECRET || 'anykey';
const { authenticateUser } = require("../../middleware/authentication");

router.get('/performance1/:userId', authenticateUser, async (req, res) => {
    // Make sure user can only access their own data
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to access this data' });
    }
  
    try {
      let performance = await Performance.findOne({ userId: req.params.userId });
      
      if (!performance) {
        // Create new performance record if none exists
        performance = new Performance({
          userId: req.params.userId,
          totalGames: 0,
          totalCorrect: 0,
          totalScore: 0,
          gameTypes: {},
          dailyStats: {},
          history: []
        });
        await performance.save();
      }
      
      res.json(performance);
    } catch (err) {
      console.error('Get performance error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.post('/performance/:userId', authenticateUser, async (req, res) => {
    // Make sure user can only update their own data
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to update this data' });
    }
  
    try {
      const performanceData = req.body;
      
      // Update or create performance record
      const performance = await Performance.findOneAndUpdate(
        { userId: req.params.userId },
        performanceData,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      
      res.json(performance);
    } catch (err) {
      console.error('Update performance error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.delete('/performance/:userId', authenticateUser, async (req, res) => {
    // Make sure user can only delete their own data
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this data' });
    }
  
    try {
      // Reset performance data
      await Performance.findOneAndUpdate(
        { userId: req.params.userId },
        {
          totalGames: 0,
          totalCorrect: 0,
          totalScore: 0,
          gameTypes: {},
          dailyStats: {},
          history: []
        },
        { new: true }
      );
      
      res.json({ message: 'Performance data cleared successfully' });
    } catch (err) {
      console.error('Delete performance error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;