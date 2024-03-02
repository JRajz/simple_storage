const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { DATABASE } = require('../config');

const models = {};

const modelsPath = path.join(__dirname, '../models');

// Initialize Sequelize instance
const sequelize = new Sequelize(DATABASE.NAME, DATABASE.USER, DATABASE.PASSWORD, {
  host: DATABASE.HOST,
  dialect: DATABASE.DIALECT,
  charset: DATABASE.CHARSET,
  collate: DATABASE.COLLATE,
  benchmark: true, // log query time
  logging: DATABASE.LOG_QUERY ? console.log : false, // Enable logging if configured
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections in the pool
    acquire: 30000, // Maximum time, in milliseconds, that a connection can be idle before being released
    idle: 10000, // Maximum time, in milliseconds, that a connection can remain idle in the pool before being closed
  },
});

// Load models dynamically
fs.readdirSync(modelsPath)
  .filter((file) => file.endsWith('.js') && file !== 'index.js')
  .forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const model = require(`${modelsPath}/${file}`)(sequelize, Sequelize.DataTypes);
    models[model.name] = model;
  });

// Associate models if associations are defined
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  models,
  sequelize,
};
