// We import Express Router to create modular route handlers
const { Router } = require("express");

// We create a dedicated router for comment-related endpoints
const commentRouter = Router();

// We import our comment controller functions
const { commentPost, updateComment, deleteComment } = require('../controller/commentcontroller');

// We import necessary middleware for authentication and authorization
const { authmiddleware } = require('../middleware/middlewares');



// --- ROUTE DEFINITIONS --- //

//Create a new comment on a post
commentRouter.post('/:postId', authmiddleware, commentPost);

// Modify an existing comment
commentRouter.put('/update/:commentId', authmiddleware, updateComment);

// Remove a comment
commentRouter.delete('/delete/:commentId', authmiddleware, deleteComment);

// We export the configured router for use in our main application
module.exports = commentRouter;