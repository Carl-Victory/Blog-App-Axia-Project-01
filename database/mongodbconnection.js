// We import the Mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// We load environment variables from .env file
require('dotenv').config();

// --- DATABASE CONNECTION --- //
// We define the function to establish connection with MongoDB
const connectDB = async (req, res) => {
    try {
        // We attempt to connect using the URI from environment variables
        await mongoose.connect(process.env.MONGODB)
        // We log successful connection
        console.log('Database connected');
    } catch (error) {
        // If connection fails, we log the error
        console.log(error);
    } 
}

// We export the connection function for use in the application
module.exports = connectDB;