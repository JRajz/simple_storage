const { celebrate, Joi } = require('celebrate');
const { Validate } = require('../utilities');

module.exports = {
  upload: celebrate({
    body: Joi.object().keys({
      name: Validate.stringReq,
      description: Validate.stringReq.min(5),
      file: Validate.fileReq,
    }),
    query: Joi.object().keys({}),
    params: Joi.object().keys({}),
  }),
  directoryUpload: celebrate({
    body: Joi.object().keys({
      name: Validate.stringReq,
      description: Validate.stringReq.min(5),
      file: Validate.fileReq,
    }),
    query: Joi.object().keys({}),
    params: Joi.object().keys({
      directoryId: Validate.idReq,
    }),
  }),
  updateMetaData: celebrate({
    body: Joi.object().keys({
      name: Validate.stringReq,
      description: Validate.stringReq.min(5),
    }),
    query: Joi.object().keys({}),
    params: Joi.object().keys({
      id: Validate.idReq,
    }),
  }),
  delete: celebrate({
    body: Joi.object().keys({}),
    query: Joi.object().keys({}),
    params: Joi.object().keys({
      id: Validate.idReq,
    }),
  }),
  paramsFileId: celebrate({
    body: Joi.object().keys({}),
    query: Joi.object().keys({}),
    params: Joi.object().keys({
      id: Validate.idReq,
    }),
  }),
  uploadVersion: celebrate({
    body: Joi.object().keys({
      name: Validate.stringReq,
      description: Validate.stringReq.min(5),
      file: Validate.fileReq,
    }),
    query: Joi.object().keys({}),
    params: Joi.object().keys({
      id: Validate.idReq,
    }),
  }),
  versionRestore: celebrate({
    body: Joi.object().keys({}),
    query: Joi.object().keys({}),
    params: Joi.object().keys({
      id: Validate.idReq,
      versionId: Validate.idReq,
    }),
  }),
  setAccess: celebrate({
    body: Joi.object().keys({
      accessType: Joi.string().valid('public', 'private', 'partial').required(),
      allowedUserIds: Joi.when('accessType', {
        is: 'partial',
        then: Validate.idsReq,
        otherwise: Joi.forbidden(),
      }),
    }),
    query: Joi.object().keys({}),
    params: Joi.object().keys({
      id: Validate.idReq,
    }),
  }),
  removeUserAccess: celebrate({
    body: Joi.object().keys({}),
    query: Joi.object().keys({}),
    params: Joi.object().keys({
      id: Validate.idReq,
      userId: Validate.idReq,
    }),
  }),
};
