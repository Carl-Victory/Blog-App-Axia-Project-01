// We import our core dependencies
const express = require('express'); // The Express framework
const mongoose = require('mongoose'); // MongoDB ODM
const cookieParser = require('cookie-parser'); // For handling cookies
const connectDB = require('./database/mongodbconnection'); // Our database connector

// We import our route handlers
const userRouter = require('./routers/userroutes'); // User-related endpoints
const postRouter = require('./routers/postroutes'); // Post-related endpoints
const commentRouter = require('./routers/commentroutes'); // Comment endpoints

// We initialize our Express application
const app = express();

// We load environment variables from .env file
require('dotenv').config();

// We set our server port from environment variables
const port = process.env.PORT;



// --- MIDDLEWARE SETUP --- //
// These will process all incoming requests

// We add JSON parsing middleware for request bodies
app.use(express.json());

// We add URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));

// We add cookie parsing middleware
app.use(cookieParser());



// --- ROUTE REGISTRATION --- //
// We mount our routers to specific paths

// All user routes will be prefixed with /api/user
app.use('/api/user', userRouter);

// All post routes will be prefixed with /api/post
app.use('/api/post', postRouter);

// All comment routes will be prefixed with /api/comment
app.use('/api/comment', commentRouter);



// --- DATABASE CONNECTION --- //
// We establish connection to MongoDB
connectDB();

// --- BASIC ROUTE FOR TESTING --- //
// A simple route to verify the server is running
app.get('/', (req, res) => {
    res.send('Welcome to my Blog API');
});

// --- SERVER INITIALIZATION --- //
// We start listening on the configured port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});