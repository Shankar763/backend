const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true }, // Unique ID for each user
    points: { type: Number, default: 0 }, // Points accumulated by the user
    pointsBalance: { type: Number, default: 0 }, // Points balance available
    multitapLevelIndex: { type: Number, default: 0 }, // Level of multitap upgrade
    energy: { type: Number, default: 500 }, // Available energy
    energyRefillsLeft: { type: Number, default: 6 }, // Number of energy refills remaining
    energyLimitLevelIndex: { type: Number, default: 0 }, // Energy limit level
    mineLevelIndex: { type: Number, default: 0 }, // Mining level
    lastpointsUpdateTimestamp: { type: Date, default: Date.now }, // Last update to points
    lastEnergyUpdateTimestamp: { type: Date, default: Date.now }, // Last update to energy
    lastEnergyRefillsTimestamp: { type: Date, default: Date.now }, // Last time energy refills were updated
});

const itemModel = mongoose.model("Item", itemSchema);
module.exports = itemModel;
