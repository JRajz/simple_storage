const { Joi } = require('celebrate');

const string = Joi.string().trim().max(255);
const stringReq = string.required();
const text = Joi.string().trim().max(65535);
const textReq = text.required();
const number = Joi.number();
const numberReq = number.required();
const posNum = number.positive().min(1);
const posNumReq = posNum.required();
const integer = number.integer();
const intReq = integer.required();
const posInt = posNum.integer();
const posIntReq = posInt.required();
const posIntegers = Joi.array().items(posInt).unique();
const posIntsReq = Joi.array().items(posIntReq).unique().required();
const email = string.email().lowercase().label('Email');
const emailReq = email.required();
const password = string.alphanum().min(8).max(20).label('Password');
const passReq = password.required();
const search = Joi.string().trim().min(3).allow('');

const file = Joi.object().keys({
  fieldname: stringReq,
  originalname: stringReq,
  encoding: stringReq,
  mimetype: stringReq,
  size: posNumReq,
  destination: stringReq,
  filename: stringReq,
  path: stringReq,
});

module.exports = {
  file,
  fileReq: file.required(),
  id: posInt,
  idReq: posIntReq,
  ids: posIntegers,
  idsReq: posIntsReq,
  password,
  passReq,
  // pageLimit: posInt.max(MaxPageLimit).default(MaxPageLimit),
  page: posInt.default(1),
  string,
  stringReq,
  text,
  textReq,
  number,
  numberReq,
  posNum,
  posNumReq,
  integer,
  intReq,
  posInt,
  posIntReq,
  posIntegers,
  posIntsReq,
  email,
  emailReq,
  search,
};
