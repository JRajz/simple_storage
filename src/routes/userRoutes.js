const router = require('express').Router();
const { UserController } = require('../controllers');
const userValidator = require('../validators/userValidator');

// Route for user signup
router.post('/signup', userValidator.signup, UserController.signUp);

// Route for user signin
router.post('/signin', userValidator.login, UserController.signIn);

module.exports = router;
