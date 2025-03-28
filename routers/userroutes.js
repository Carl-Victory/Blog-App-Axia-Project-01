// We import Express Router to create modular route handlers
const { Router } = require("express");

// We create a dedicated router for user-related endpoints
const userRouter = Router();

// We import all user controller functions
const {
  registerUser,
  updateUser,
  profileUpdate,
  deleteUser,
  getUserById,
  loginUser,
  logoutUser,
} = require("../controller/usercontroller");

// We import authentication middleware
const { authmiddleware } = require('../middleware/middlewares');

// --- ROUTE DEFINITIONS --- //

// Create a new user account
// No authentication required for registration
userRouter.post('/register', registerUser);

// Authenticate an existing user
// No authentication required for login
userRouter.post('/login', loginUser);

// Retrieve user profile data
// 1. Requires valid authentication (authmiddleware)
// 2. Returns user data (getUserById)
userRouter.get('/:id', authmiddleware, getUserById);

// Update basic account information
// 1. Requires authentication (authmiddleware)
// 2. Processes account updates (updateUser)
userRouter.put('/update/:id', authmiddleware, updateUser);

// Update profile details
// 1. Requires authentication (authmiddleware)
// 2. Handles profile updates (profileUpdate)
userRouter.put('/updateprofile/:id', authmiddleware, profileUpdate);

// POST /logout - Log out the user
// 1. Verifies user authentication (authMiddleware)
// 2. Clears the authentication token (logoutUser)
userRouter.post('/logout',authmiddleware, logoutUser);

// Remove user account
// 1. Requires authentication (authmiddleware)
// 2. Handles account deletion (deleteUser)
userRouter.delete('/delete/:id', authmiddleware, deleteUser);

// We export the configured router for use in our main application
module.exports = userRouter;