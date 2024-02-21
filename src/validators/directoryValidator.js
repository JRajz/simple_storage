const { celebrate, Joi } = require('celebrate');
const { Validate } = require('../utilities');

module.exports = {
  create: celebrate({
    body: Joi.object().keys({
      name: Validate.stringReq.label('Directory Name'),
    }),
    query: Joi.object().keys({}),
  }),
};
