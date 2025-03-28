// We import the User model to interact with user data in the database
const userSchema = require('../models/usermodel');

// We require bcrypt for secure password hashing
const bcrypt = require('bcryptjs');

// We import our JWT token generator for authentication
const jwttoken = require('../jwt/jwttoken');

// We bring in express.json for request body parsing
const { json } = require('express');



// --- REGISTER USER --- //
// We define the function to create new user accounts
const registerUser = async (req, res) => {
    // We extract registration details from the request body
    const { username, email, password } = req.body;
    
    // We validate that all required fields are provided
    if (!username || !email || !password) {
        return res.status(400).json({message: 'Please fill in all fields'});
    }
    
    try {
        // We check if the email is already registered
        const user = await userSchema.findOne({ email });
        if (user) {
            return res.status(400).json({message: 'User already exists'});
        }
        
        // We generate a salt for secure password hashing
        const salt = await bcrypt.genSalt(10);
        // We create a hashed version of the password
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // We create a new user document with the hashed password
        const newUser = new userSchema({...req.body, password: hashedPassword});
        
        // We save the new user to the database
        await newUser.save();
        
        // We return the created user (password hash not visible)
        res.status(200).json({user: newUser});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Server error'});
    }
};



// --- LOGIN USER --- //
// We create the function to authenticate existing users
const loginUser = async (req, res) => {
    // We extract login credentials from the request
    const { email, password } = req.body;
    
    // We validate that both fields are provided
    if (!email || !password) {
        return res.status(400).json({message: 'Please fill in all fields'});
    }
    
    try {
        // We search for the user by email
        const user = await userSchema.findOne({ email});
        
        // If user doesn't exist, we reject the login
        if (!user) {
            return res.status(400).json({message: 'User does not exist'});
        }
        
        // We compare the provided password with the stored hash
        const comparepassword = await bcrypt.compare(password, user.password);
        
        // If passwords don't match, we reject the login
        if (!comparepassword) {
            return res.status(400).json({message: 'Invalid password'});
        }
        
        // We generate a JWT token for the authenticated session
        const token = jwttoken(user._id);
        
        // We remove the password from the user data before sending
        const { password: userPassword, ...userdata } = user.toObject();
        
        // We set the token as an HTTP-only cookie for security
        res.cookie('token', token, {httpOnly: true, samesite: 'strict'});
        
        // We return the user data (without password)
        res.status(200).json({user: userdata});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Server error'});
    }
};



// --- UPDATE USER --- //
// We define the function to modify user account details
const updateUser = async (req, res) => {
    // We get the logged-in user's ID from the auth middleware
    const userId = req.user._id;
    
    // We extract potential updates from the request body
    const { username, email, password } = req.body;
    
    // We validate that at least one field is provided
    if (!username || !email || !password) {
        return res.status(400).json({message: 'Please fill in all fields'});
    }
    
    try {
        // We prepare an object to hold updated fields
        let updatedFields = {};
        
        // We conditionally add fields to update
        if (username) updatedFields.username = username;
        if (email) updatedFields.email = email;
        if (password) {
            // If password is being updated, we hash the new one
            const salt = await bcrypt.genSalt(10);
            updatedFields.password = await bcrypt.hash(password, salt);
        }
        
        // We find and update the user, returning the new version
        const updatedUser = await userSchema.findByIdAndUpdate(
            userId, 
            { $set: updatedFields }, 
            { 
                new: true,          // Return the updated document
                select: '-password'  // Exclude password from response
            }
        );
        
        // If user isn't found, we return an error
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // We return the updated user data
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Server Eroor'});
    }
}



// --- PROFILE UPDATE --- //
// We create a function to update user profile information
const profileUpdate = async (req, res) => {
    // We get the user ID from the auth middleware
    const userId = req.user._id;
    
    // We extract profile fields from the request body
    const { handle, bio, age, phone, country } = req.body;
    
    try {
        // We update the nested profile fields
        const updatedProfile = await userSchema.findByIdAndUpdate(
            userId,
            {$set: {
                'profile.handle' : handle,
                'profile.bio' : bio,
                'profile.age' : age,
                'profile.phone' : phone,
                'profile.country' : country
            }}, 
            {new: true} // Return the updated document
        );
        
        // If update fails, we return an error
        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile cannot be updated' });
        }
        
        // We return the updated profile
        res.status(200).json(updatedProfile);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Server error'});
    }
}



// --- GET USER --- //
// We define a function to fetch user details
const getUserById = async (req, res) => {
    // We get the user ID from the auth middleware
    const userId = req.user._id;

    try {
        // We find the user by ID, excluding the password field
        const user = await userSchema.findById(userId).select('-password');

        // If user doesn't exist, we return an error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // We return the user data
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



// --- LOGOUT USER --- //
// We define a function to log out users by clearing their authentication token
const logoutUser = async (req, res) => {
    try {
        // We clear the HTTP-only cookie that stores the JWT token
        res.clearCookie('token', {
            httpOnly: true, // Ensures the cookie is not accessible via JavaScript
            sameSite: 'strict', // Prevents CSRF attacks by restricting cross-site requests
            secure: process.env.NODE_ENV === 'production' // Ensures the cookie is sent only over HTTPS in production
        });

        // We send a success response to confirm the user is logged out
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ message: 'Server error' }); // Return a generic server error message
    }
};


// --- DELETE USER --- //
// We create a function to remove user accounts
const deleteUser = async (req, res) => {
    // We get the user ID from the auth middleware
    const usersId = req.user._id;
    
    try {
        // We delete the user account
        const user = await userSchema.findByIdAndDelete(usersId);
        
        // If user doesn't exist, we return an error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // We attempt to delete all posts by this user
        const deleteUsersPosts = await postSchema.deletemany({ userId : usersId });

        // We confirm successful deletion
        res.status(200).json({ message: 'User deleted successfully' });
        
        // If posts were deleted, we include that in the response
        if(deleteUsersPosts){
            res.json({message: 'users posts deleted successfully'});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Server Eroor'});
    }
}

// We export all user-related functions for use in routes
module.exports = {
    registerUser, 
    updateUser, 
    profileUpdate, 
    deleteUser, 
    getUserById, 
    loginUser,
    logoutUser
};