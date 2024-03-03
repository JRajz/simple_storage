const { celebrate, Joi } = require('celebrate');
const { Validate } = require('../utilities');

module.exports = {
  signup: celebrate({
    body: Joi.object().keys({
      name: Validate.stringReq,
      email: Validate.emailReq,
      password: Validate.passReq,
    }),
    query: Joi.object().keys({}),
    params: Joi.object().keys({}),
  }),
  login: celebrate({
    body: Joi.object().keys({
      email: Validate.emailReq,
      password: Validate.passReq,
    }),
    query: Joi.object().keys({}),
    params: Joi.object().keys({}),
  }),
  getProfile: celebrate({
    body: Joi.object().keys({}),
    query: Joi.object().keys({}),
    params: Joi.object().keys({}),
  }),
  getUserByEmail: celebrate({
    body: Joi.object().keys({}),
    query: Joi.object().keys({
      email: Validate.emailReq,
    }),
    params: Joi.object().keys({}),
  }),
};
