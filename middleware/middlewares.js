// We import jsonwebtoken for token verification
const jwt = require('jsonwebtoken');
// We require the User model to fetch user data
const userSchema = require('../models/usermodel');
// We import dotenv to manage environment variables
require('dotenv').config();

// --- AUTHENTICATION MIDDLEWARE --- //
// We create middleware to verify user authentication
const authmiddleware = async (req, res, next) => {
    // We extract the JWT token from HTTP-only cookies
    const token = req.cookies.token; // Get token from cookies (used in web apps)

    // If no token exists, we deny access
    if (!token) {
        return res.status(401).json({ message: 'Please login to continue' });
    }

    try {
        // We verify the token using our secret key
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);

        // If verification fails, we reject the request
        if (!verifiedToken) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // We fetch the user from database, excluding the password
        const user = await userSchema.findById(verifiedToken.id).select('-password');

        // If user doesn't exist, we return an error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // We attach the user object to the request for downstream use
        req.user = user;
        // We pass control to the next middleware/route
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// We export all middleware functions for use in routes
module.exports = { authmiddleware };