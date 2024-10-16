const express = require('express');
const connectDB = require('./db.js');
const itemModel = require('./models/item.js');
const refer = require('./models/referral.js');  // Assuming 'itemModel' is renamed to 'User'
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'https://bbq1-six.vercel.app'  // Replace this with your frontend URL
    // origin: 'http://localhost:5173'  // Replace this with your frontend URL
}));
connectDB();

// Route to check if a user exists by telegramId
app.get('/user/checkdb/:telegramId', async (req, res) => {
    const { telegramId } = req.params;

    try {
        const user = await User.findOne({ telegramId });
    
        if (user) {
          res.status(200).json(user);  // User found, send back the user data
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: 'Internal server error' });
      }
   
});


// Route to create a new user
app.post('/user/create/:telegramId', async (req, res) => {
    const { telegramId} =  req.params;
  
    try {
      // Check if the user already exists (extra safety)
      let user = await User.findOne({ telegramId });
  
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      } 

      user = new User({
        telegramId,  // Only setting the telegramId; all other fields will use default values
      });
      await user.save();  // Save the user in the database
      res.status(201).json(user);  // Return the newly created user data
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


//update user points
// Update or create user by Telegram ID
app.post('/user/updatepoints:telegramId', async (req, res) => {
    const { telegramId } = req.params;
    const updatedPoints = req.body;

    try {
        let user = await itemModel.findOne({ telegramId }); // Search for user by Telegram ID
        if (user) {
            // Update user data
            user.points =updatedPoints.points;
            user.lastPointsUpdateTimestamp = new Date();
            await user.save();
        } else {
            // Create a new user
            return res.status(404).json({ message: 'User not found' }); // User not found
        }
        return res.json({ success: true, user });
    } catch (error) {
        console.error("Error updating points:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Fetch user by Telegram ID
app.get('/user/:telegramId', async (req, res) => {
    const { telegramId } = req.params;
    try {
        const user = await itemModel.findOne({ telegramId }); // Search for user by Telegram ID
        if (user) {
            return res.json(user); // Return user data if found
        } else {
            return res.status(404).json({ message: 'User not found' }); // User not found
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Upgrade user task level, PPH, and points
app.post('/user/:telegramId/upgrade', async (req, res) => {
    const { telegramId } = req.params;
    const { title, newLevel, newPPH, pointsForUpgrade, pointsToDeduct } = req.body;

    try {
        // Find the user by Telegram ID
        const user = await itemModel.findOne({ telegramId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the task (by title) already exists in the user's levels
        const taskIndex = user.levels.findIndex(level => level.title === title);
        if (taskIndex >= 0) {
            // Task exists, update its level and PPH
            user.levels[taskIndex].level = newLevel;
            user.levels[taskIndex].achievedAt = new Date(); // Update the achievement time
        } else {
            // Task doesn't exist, add a new task with level 1
            user.levels.push({ title, level: newLevel, achievedAt: new Date() });
        }

        // Deduct points from user
        user.points -= pointsToDeduct;
        user.pph += newPPH;  // Update PPH (profit per hour)
        user.lastPointsUpdateTimestamp = new Date();  // Update points update timestamp

        await user.save();  // Save the updated user data

        return res.json({ success: true, user });
    } catch (error) {
        console.error("Error upgrading task:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Update or create user by Telegram ID
app.post('/user/:telegramId', async (req, res) => {
    const { telegramId } = req.params;
    const userData = req.body;

    try {
        let user = await itemModel.findOne({ telegramId }); // Search for user by Telegram ID
        if (user) {
            // Update user data
            user.points = userData.points;
            user.energy = userData.energy; // Ensure energy is defined in your schema
            user.lastPointsUpdateTimestamp = new Date();
            await user.save();
        } else {
            // Create a new user
            user = new itemModel({ telegramId, ...userData }); // Ensure telegramId is included
            await user.save();
        }
        return res.json({ success: true, user });
    } catch (error) {
        console.error("Error updating or creating user:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Check if task is completed and update user points
app.post('/user/:telegramId/task_check', async (req, res) => {
    const { telegramId } = req.params;
    const { task, award } = req.body;

    try {
        // Search for user by Telegram ID
        const user = await itemModel.findOne({ telegramId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize tasks_completed if it doesn't exist
        if (!user.tasks_completed) {
            user.tasks_completed = []; // Use the correct field name from your schema
        }

        // Check if the task is already completed by the user
        const taskCompleted = user.tasks_completed.includes(task);
        if (taskCompleted) {
            return res.json({ message: 'Task already completed', taskCompleted: true });
        }

        // If task is not completed, add it to tasks_completed and award points
        user.tasks_completed.push(task);
        user.points += parseInt(award, 10) || 0;  // Ensure award is a number and defaults to 0
        await user.save();  // Save the updated user data

        return res.json({ message: 'Task added and points awarded successfully', taskCompleted: false, user });
    } catch (error) {
        console.error("Error updating user data:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// POST: Save referral information
app.post('/refer/referrals', async (req, res) => {
  const { userId, referrerId } = req.body;

  if (!userId || !referrerId) {
    return res.status(400).json({ error: 'Missing userId or referrerId' });
  }

  try {
    // Log data
    console.log('Incoming data:', userId, referrerId);

    // Check if the user already exists
    let user = await refer.findOne({ userId });

    if (!user) {
      console.log('Creating new user');
      user = new refer({ userId, referrerId, referrals: [] });
    }

    // Save referrer if not self-referring and referrer not already added
    if (userId !== referrerId && !user.referrals.includes(referrerId)) {
      user.referrals.push(referrerId);
    }

    // Save the user in the database
    await user.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Error saving referral:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Fetch referral data
app.get('/refer/referrals', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    console.log('Fetching referrals for userId:', userId);
    const user = await refer.findOne({ userId });

    if (!user) {
      return res.json({ referrals: [], referrer: null });
    }

    return res.json({ referrals: user.referrals, referrer: user.referrerId });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(process.env.PORT, () => {
    console.log("App is running on port " + process.env.PORT);
});
