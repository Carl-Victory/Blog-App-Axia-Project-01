// We import the Post model to verify post existence before commenting.
const postSchema = require('../models/postmodel');

// We bring in the Comment model to create and manage comments.
const commentSchema = require('../models/commentmodel');



// --- CREATE COMMENT --- //
// We define the function to add comments to posts.
const commentPost = async (req, res) => {
    try {
        // We extract the comment content from the request body.
        const { content } = req.body;
        // We get the post ID from the URL parameters.
        const { postId } = req.params;

        // We validate that the comment has content.
        if (!content) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        // We check if the post exists in the database.
        const post = await postSchema.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // We create a new comment document with user and post references.
        const comment = new commentSchema({
            content,
            username: req.user.username, // Attach the commenter's username from auth middleware
            userId: req.user._id,       // Reference the commenter's user ID
            postId                      // Link to the parent post
        });

        // We save the new comment to the database.
        await comment.save();

        // We fetch all comments for this post to return the updated list.
        const allComments = await commentSchema.find({ postId });

        // We return the complete comment list for the post.
        res.status(201).json(allComments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



// --- UPDATE COMMENT --- //
// We create the function to modify existing comments.
const updateComment = async (req, res) => {
    try {
        // We get the comment ID from URL parameters.
        const { commentId } = req.params;
        // We extract the new content from the request body.
        const { content } = req.body;

        // We attempt to update the comment, but only if:
        // 1. The comment exists, AND
        // 2. The requesting user is the original commenter
        const comment = await commentSchema.findOneAndUpdate(
            { _id: commentId, userId: req.user._id }, // Security check
            { content },
            { new: true } // Return the updated document
        );

        // If update fails, we inform the user they're unauthorized.
        if (!comment) {
            return res.status(403).json({ 
                message: "You are not authorized to update this comment or it doesn't exist" 
            });
        }

        // We return the successfully updated comment.
        res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



// --- DELETE COMMENT --- //
// We define the function to remove comments.
const deleteComment = async (req, res) => {
    try {
        // We extract the comment ID from URL parameters.
        const { commentId } = req.params;

        // We attempt to delete the comment, but only if:
        // 1. The comment exists, AND
        // 2. The requesting user is the original commenter
        const comment = await commentSchema.findOneAndDelete({ 
            _id: commentId, 
            userId: req.user._id 
        });

        // If deletion fails, we inform the user they're unauthorized.
        if (!comment) {
            return res.status(403).json({ 
                message: "You are not authorized to delete this comment or it doesn't exist" 
            });
        }

        // We confirm successful deletion.
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// We export all comment-related functions for use in routes.
module.exports = { 
    commentPost, 
    updateComment, 
    deleteComment 
};