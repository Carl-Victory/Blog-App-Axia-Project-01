// We import Express Router to create modular route handlers
const { Router } = require("express");

// We create a dedicated router for post-related endpoints
const postRouter = Router();

// We import our post controller functions
const {
  createPost,
  getPosts,
  getPostbyId,
  updatePost,
  deletePost,
  searchPosts
} = require('../controller/postcontroller');

// We import necessary middleware for authentication and authorization
const { authmiddleware, postAutho } = require('../middleware/middlewares');

// --- ROUTE DEFINITIONS --- //

// POST / - Create a new post
// 1. Verifies user authentication (authmiddleware)
// 2. Handles post creation (createPost)
postRouter.post('/', authmiddleware, createPost);

// GET /all - Retrieve all posts
// 1. Verifies authentication (authmiddleware)
// 2. Fetches posts (getPosts)
postRouter.get('/all', authmiddleware, getPosts);

// GET /search - Search posts by query
// 1. Verifies authentication (authmiddleware)
// 2. Processes search request (searchPosts)
postRouter.post('/search', authmiddleware, searchPosts);

// GET /:id - Get a specific post by ID
// 1. Verifies authentication (authmiddleware)
// 2. Retrieves the specified post (getPostbyId)
postRouter.get('/:id', authmiddleware, getPostbyId);

// PUT /update/:id - Update an existing post
// 1. Verifies authentication (authmiddleware)
// 2. Checks post ownership (postAutho)
// 3. Handles the update (updatePost)
postRouter.put('/update/:id', authmiddleware, updatePost);

// DELETE /delete/:id - Remove a post
// 1. Verifies authentication (authmiddleware)
// 2. Validates ownership (postAutho)
// 3. Deletes the post (deletePost)
postRouter.delete('/delete/:id', authmiddleware, deletePost);

// We export the configured router for use in our main application
module.exports = postRouter;