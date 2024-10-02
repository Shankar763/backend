const express = require('express')
const connectDB = require('./db.js')
const itemModel = require('./models/item.js')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(cors())
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

app.listen(process.env.PORT, () => {
    console.log("App is running");
})
