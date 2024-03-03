const router = require('express').Router();
const { UserController } = require('../controllers');
const userValidator = require('../validators/userValidator');
const { authMiddleware } = require('../middlewares');

// Route for user signup
router.post('/signup', userValidator.signup, UserController.signUp);

// Route for user signin
router.post('/signin', userValidator.login, UserController.signIn);

// Route for user signout
router.post('/signout', authMiddleware, UserController.signOut);

// Route for user profile
router.get('/profile', authMiddleware, userValidator.getProfile, UserController.getProfile);

// Route for check existing user by email
router.get('/', authMiddleware, userValidator.getUserByEmail, UserController.getUserByEmail);

module.exports = router;
