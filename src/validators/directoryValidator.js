const { celebrate, Joi } = require('celebrate');
const { Validate } = require('../utilities');

module.exports = {
  create: celebrate({
    body: Joi.object().keys({
      name: Validate.stringReq.label('Directory Name'),
    }),
    query: Joi.object().keys({}),
  }),
  update: celebrate({
    body: Joi.object().keys({
      name: Validate.stringReq.label('Directory Name'),
    }),
    params: Joi.object().keys({
      directoryId: Validate.posIntReq.label('Directory Id'),
    }),
    query: Joi.object().keys({}),
  }),
  delete: celebrate({
    body: Joi.object().keys({}),
    params: Joi.object().keys({
      directoryId: Validate.posIntReq.label('Directory Id'),
    }),
    query: Joi.object().keys({}),
  }),
};
