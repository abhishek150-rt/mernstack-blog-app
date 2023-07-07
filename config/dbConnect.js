const mongoose = require('mongoose');
require("dotenv").config()
const mongoURL= process?.env?.URL

async function connectToDatabase() {
    
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            
        });
        console.log('Connected to the database!');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
}

module.exports = connectToDatabase