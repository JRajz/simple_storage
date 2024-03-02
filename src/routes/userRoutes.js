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

module.exports = router;
