const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true }, // Unique ID for each user
    points: { type: Number, default: 0 }, // Points accumulated by the user
    taks_complited:[],
    lastpointsUpdateTimestamp: { type: Date, default: Date.now }, // Last update to points
    lastEnergyUpdateTimestamp: { type: Date, default: Date.now }, // Last update to energy
    lastEnergyRefillsTimestamp: { type: Date, default: Date.now }, // Last time energy refills were updated
});

const itemModel = mongoose.model("Item", itemSchema);
module.exports = itemModel;
