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
  }),
  login: celebrate({
    body: Joi.object().keys({
      email: Validate.emailReq,
      password: Validate.passReq,
    }),
    query: Joi.object().keys({}),
  }),
};
