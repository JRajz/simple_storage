// middleware/validationMiddleware.js

const { celebrate, Joi } = require('celebrate');

const userRegister = celebrate({
  body: Joi.object({
    name: Joi.string().alphanum().min(3).max(30)
      .required()
      .messages({
        'string.base': 'Name must be a string',
        'string.alphanum': 'Name must only contain alphanumeric characters',
        'string.min': 'Name must be at least {#limit} characters long',
        'string.max': 'Name cannot exceed {#limit} characters',
        'any.required': 'Name is required',
      }),
    email: Joi.string().email().required().messages({
      'string.pattern.base': 'Password must be alphanumeric and between 3 to 30 characters long',
      'any.required': 'Password is required',
    }),
    password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required().messages({
      'string.pattern.base': 'Password must be alphanumeric and between 3 to 30 characters long',
      'any.required': 'Password is required',
    }),
  }),
  query: Joi.object({}).unknown(false), // Ensure query parameters are empty
});

const userSignIn = celebrate({
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required',
    }),
    password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required().messages({
      'string.pattern.base': 'Password must be alphanumeric and between 3 to 30 characters long',
      'any.required': 'Password is required',
    }),
  }),
  query: Joi.object({}).unknown(false), // Ensure query parameters are empty
});

module.exports = { userRegister, userSignIn };
