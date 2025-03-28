// We import the Post model to interact with post data in the database
const postSchema = require('../models/postmodel');


// --- CREATE POST --- //
// We define the function to let users create new posts
const createPost = async(req, res) => {
    // We extract the post content from the request body
    const { content } = req.body
    
    // We validate the content length (1-280 characters)
    if (!content || content.length > 280){
        return res.status(401).json({message: 'Content must be between 1-280 characters'})};
    
    try {
        // We create a new post document with user references
        const post = new postSchema({
            userId: req.user._id,     // Attach the creator's user ID
            username: req.user.username, // Include the username
            content                  // Add the post content
        });
        
        // We save the new post to the database
        await post.save();
        // We return the created post with 201 status
        res.status(201).json(post);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};



// --- GET ALL POSTS --- //
// We create a function to fetch all posts
const getPosts = async (req, res) => {
    try {
        // We retrieve all posts from the database
        const posts = await postSchema.find()

        // We send the posts back to the client
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



// --- GET SINGLE POST --- //
// We define a function to fetch a specific post by ID
const getPostbyId = async (req, res) => {
    // We extract the post ID from URL parameters
    const { id } = req.params;

    try {
        // We find the post by ID and populate user info
        const post = await postSchema.findById(id).populate('userId', 'username');
        
        // If post doesn't exist, we return 404
        if (!post) {
            return res.status(403).json({message: 'Post not found'});
        }

        // We respond with the found post
        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}



// --- SEARCH POSTS --- //
// We build a function for full-text post search
const searchPosts = async (req, res) => {
    try {
        // We extract search parameters from query string
        const { query, page = 1, limit = 10 } = req.body;

        // We validate that a search query exists
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // We prepare search criteria for title and content
        const searchCriteria = {
            $or: [
                { title: { $regex: query, $options: 'i' } }, // Case-insensitive title search
                { content: { $regex: query, $options: 'i' } } // Case-insensitive content search
            ]
        };

        // We calculate pagination skip value
        const skip = (page - 1) * limit;
        
        // We execute the search with pagination
        const posts = await postSchema
            .find(searchCriteria)
            .skip(skip)
            .limit(Number(limit));

        // We count total matching posts for pagination metadata
        const total = await postSchema.countDocuments(searchCriteria);

        // We return results with pagination info
        res.status(200).json({
            total,
            page: Number(page),
            limit: Number(limit),
            posts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



// --- UPDATE POST --- //
// We create a function to modify existing posts
const updatePost = async (req, res) => {
    // We get the new content and post ID
    const { content } = req.body;
    const { id } = req.params;

    // We re-validate content length
    if (!content || content.length > 280){
        res.status(401).json({message: 'Content must be between 1-280 characters'})};
    
    try {
        // We find the post by ID
        const post = await postSchema.findById(id);
        
        // If post doesn't exist, we return 404
        if (!post) {
            return res.status(404).json({message: 'Post not found'});
        }
        
        // We verify the requester owns the post
        if (post.userId.toString() !== req.user._id.toString()){
            return res.status(401).json({message: 'You are not authorized to edit this post'});
        }

        // We update the post content
        post.content = content;
        
        // We save the updated post
        const updatedPost = await post.save();

        // We return success message and updated post
        res.status(200).json({message: 'Post updated successfully', updatedPost});
    } catch (error) {
        console.log(error); 
        res.status(500).json({message: 'Server Error'}); 
    }
};



// --- DELETE POST --- //
// We define a function to remove posts
const deletePost = async (req,res) => {
    // We get the post ID from URL parameters
    const { id } = req.params;

    try {
        // We attempt to delete the post only if user is owner
        const post = await postSchema.findOneAndDelete({ 
            _id: id, 
            userId: req.user._id 
        });

        // If deletion fails, we explain why
        if (!post) {
            return res.status(404).json({ 
                message: 'Post not found or you are not authorized to delete it' 
            });
        }

        // We confirm successful deletion
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.log(error); 
        res.status(404).json({message: 'Server error'});
    }
}


// We export all post-related functions for use in routes
module.exports = { 
    createPost, 
    getPosts, 
    getPostbyId, 
    searchPosts,
    updatePost, 
    deletePost 
};