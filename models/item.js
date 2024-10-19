const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true }, // Unique ID for each user
    points: { type: Number, default: 0 }, // Points accumulated by the user
    pph: {type: Number, default:0},
    tasks_completed: { type: [String], default: [] }, // Array of completed tasks
    lastPointsUpdateTimestamp: { type: Date, default: Date.now }, // Last update to points
    levels: [{ title: String, level: Number, achievedAt: Date }], // Track levels with titles
    fullTankCount:{type: Number, default:0},
    lastFullTankUpgradeTimestamp:{ type: Date, default: Date.now },
    multitapLevel: {type:Number, default:0},
    energyLimitLevel: {type:Number, default:0},
    energyLimit: {type:Number, default:5000},
    energy: {type:Number, default:0}




});

// Create the model using the schema
const itemModel = mongoose.model("Item", itemSchema);
module.exports = itemModel;
