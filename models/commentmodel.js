// We import Mongoose to create our schema and model
const mongoose = require('mongoose');

// --- COMMENT SCHEMA DEFINITION --- //
// We design the structure for comments in our database
const commentSchema = new mongoose.Schema({
    // The comment text with a 280-character limit (like Twitter)
    content: {
        type: String,
        maxlength: 280,  // Maximum length constraint
        required: true   // Mandatory field
    },
    
    // The display name of the comment author
    username: {
        type: String,
        required: false  // Optional field for flexibility
    },
    
    // Reference to the User who created this comment
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',      // Creates relationship with User model
        required: true    // Every comment must have an author
    },
    
    // Reference to the Post being commented on
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',      // Creates relationship with Post model
        required: true    // Every comment must belong to a post
    }
},{
    // Automatic timestamps for creation and updates
    timestamps: true 
});

// We compile the schema into a model for database operations
module.exports = mongoose.model('Comment', commentSchema);