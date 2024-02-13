const router = require('express').Router();
const { UserController } = require('../controllers');
const { userRegister, userSignIn } = require('../middlewares/validation');

// Route for user signup
router.post('/signup', userRegister, UserController.signUp);

// Route for user signin
router.post('/signin', userSignIn, UserController.signIn);

module.exports = router;
