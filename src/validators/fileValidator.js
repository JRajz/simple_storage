const { celebrate, Joi } = require('celebrate');
const { Validate } = require('../utilities');

module.exports = {
  upload: celebrate({
    body: Joi.object().keys({
      file: Validate.fileReq,
    }),
  }),
  directoryUpload: celebrate({
    body: Joi.object().keys({
      file: Validate.fileReq,
    }),
    query: Joi.object().keys({}),
    params: Joi.object().keys({
      directoryId: Validate.idReq,
    }),
  }),
};
