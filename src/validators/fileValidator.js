const { celebrate, Joi } = require('celebrate');
const { Validate } = require('../utilities');

module.exports = {
  upload: celebrate({
    body: Joi.object().keys({
      file: Validate.file,
    }),
  }),
  directoryUpload: celebrate({
    body: Joi.object().keys({
      file: Validate.file,
    }),
    query: Joi.object().keys({}),
    params: Joi.object().keys({
      directoryId: Validate.idReq,
    }),
  }),
};
