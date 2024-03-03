const { celebrate, Joi } = require('celebrate');
const { Validate } = require('../utilities');

module.exports = {
  getAll: celebrate({
    body: Joi.object().keys({}),
    query: Joi.object().keys({
      directoryId: Validate.id.default(null).label('Directory Id'),
    }),
  }),
  create: celebrate({
    body: Joi.object().keys({
      name: Validate.stringReq.label('Directory Name'),
      directoryId: Validate.id.default(null).label('Directory Id'),
    }),
    query: Joi.object().keys({}),
  }),
  update: celebrate({
    body: Joi.object().keys({
      name: Validate.stringReq.label('Directory Name'),
    }),
    params: Joi.object().keys({
      directoryId: Validate.idReq.label('Directory Id'),
    }),
    query: Joi.object().keys({}),
  }),
  delete: celebrate({
    body: Joi.object().keys({}),
    params: Joi.object().keys({
      directoryId: Validate.idReq.label('Directory Id'),
    }),
    query: Joi.object().keys({}),
  }),
};
