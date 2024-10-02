const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
    
};

module.exports = connectDB;