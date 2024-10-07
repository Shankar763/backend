const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true }, // Unique ID for each user
    points: { type: Number, default: 0 }, // Points accumulated by the user
    pph: {type: Number, default:0},
    tasks_completed: { type: [String], default: [] }, // Array of completed tasks
    lastPointsUpdateTimestamp: { type: Date, default: Date.now }, // Last update to points
    lastEnergyUpdateTimestamp: { type: Date, default: Date.now }, // Last update to energy
    lastEnergyRefillsTimestamp: { type: Date, default: Date.now }, // Last time energy refills were updated
});

// Create the model using the schema
const itemModel = mongoose.model("Item", itemSchema);
module.exports = itemModel;
