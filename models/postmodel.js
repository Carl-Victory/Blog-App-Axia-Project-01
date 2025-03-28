const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: {type: String, maxlength: 280, required: true}, //The content of the post (limited to 280 characters)
    username : {type: String, required: false}, //Username of the user who created the post
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // ID of the user who created the post
});

module.exports = mongoose.model('Post', postSchema);


