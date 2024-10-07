const express = require('express');
const connectDB = require('./db.js');
const itemModel = require('./models/item.js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'https://bbq1-six.vercel.app'  // Replace this with your frontend URL
    // origin: 'http://localhost:5173'  // Replace this with your frontend URL
}));
connectDB();

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

app.listen(process.env.PORT, () => {
    console.log("App is running on port " + process.env.PORT);
});
