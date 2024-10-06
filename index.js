const express = require('express')
const connectDB = require('./db.js')
const itemModel = require('./models/item.js')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(cors({
    // origin: 'https://bbq1-six.vercel.app'  // Replace this with your frontend URL
    origin: 'http://localhost:5173'  // Replace this with your frontend URL
}));
connectDB()

// Fetch user by Telegram ID
app.get('/user/:telegramId', async (req, res) => {
    const { telegramId } = req.params
    try {
        const user = await itemModel.findOne({ telegramId }) // Search for user by Telegram ID
        if (user) {
            return res.json(user) // Return user data if found
        } else {
            return res.status(404).json({ message: 'User not found' }) // User not found
        }
    } catch (error) {
        console.error("Error fetching user data:", error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})

// Update or create user by Telegram ID
app.post('/user/:telegramId', async (req, res) => {
    const { telegramId } = req.params
    const userData = req.body

    try {
        let user = await itemModel.findOne({ telegramId }) // Search for user by Telegram ID
        if (user) {
            // Update user data
            user.points = userData.points
            user.energy = userData.energy
            user.lastpointsUpdateTimestamp = new Date()
            await user.save()
        } else {
            // Create a new user
            user = new itemModel(userData)
            await user.save()
        }
        return res.json({ success: true, user })
    } catch (error) {
        console.error("Error updating or creating user:", error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})

app.post('/user/:telegramId/task_check', async (req, res) => {
    const { telegramId } = req.params;
    const { task, award } = req.body;  // Task and award passed in the request body

    try {
        // Search for user by Telegram ID
        const user = await itemModel.findOne({ telegramId });

        if (!user) {
            // Return message if user is not found
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the task is already completed by the user
        const taskCompleted = user.task_done.includes(task); // Assuming `task_done` is an array in the user schema
        if (taskCompleted) {
            return res.json({ message: 'Task already completed', taskCompleted: true });
        }

        // If task is not completed, add it to task_done and award points
        user.task_done.push(task);
        user.points = user.points + award;  // Increment user points with the award value
        await user.save();  // Save the updated user data

        return res.json({ message: 'Task added and points awarded successfully', taskCompleted: false, user });
    } catch (error) {
        console.error("Error updating user data:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.listen(process.env.PORT, () => {
    console.log("App is running");
})
