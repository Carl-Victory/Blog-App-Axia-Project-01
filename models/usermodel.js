// We import Mongoose to create our data schema and model
const mongoose = require('mongoose');

// --- USER SCHEMA DEFINITION --- //
// We design the structure for user accounts in our database
const userSchema = new mongoose.Schema({
    // The user's unique display name
    username: {
        type: String,
        required: true,    // Must have a username
        unique: true       // No duplicate usernames allowed
    },
    
    // The user's email address
    email: {
        type: String,
        required: true,    // Must have an email
        unique: true       // No duplicate emails allowed
    },
    
    // The user's encrypted password
    password: {
        type: String,
        required: true     // Must have a password
    },
    
    // Nested profile information
    profile: {
        // Custom profile identifier/handle
        handle: {type: String},
        
        // Short personal description
        bio: {type: String},
        
        // Age
        age: {type: Number},
        
        // Contact number
        phone: {type: String},
        
        // Country of residence
        country: {type: String}
    }
}, {
    // Automatic timestamps for account creation and updates
    timestamps: true
});

// We compile the schema into a User model for database operations
module.exports = mongoose.model('User', userSchema);