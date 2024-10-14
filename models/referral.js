const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  referrerId: { type: String, default: null },
  referrals: { type: [String], default: [] }
});

// Create the model using the schema
const refer = mongoose.model("reffer", itemSchema);
module.exports = refer;