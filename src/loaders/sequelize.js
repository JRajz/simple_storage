const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const Config = require('../config');

const basename = path.basename(__filename);
const Models = {};
const modelsPath = path.join(__dirname, '../models');

// Initialize Sequelize instance
const sequelize = new Sequelize(
  Config.Database.Name,
  Config.Database.User,
  Config.Database.Password,
  {
    host: Config.Database.Host,
    dialect: Config.Database.Dialect,
    charset: Config.Database.Charset,
    collate: Config.Database.Collate,
    benchmark: true, // log query time
    // eslint-disable-next-line no-console
    logging: Config.Database.LogQuery ? console.log : false,
  },
);

// Load models dynamically
fs.readdirSync(modelsPath)
  .filter((file) => file.endsWith('.js') && file !== basename)
  .forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const model = require(`${modelsPath}/${file}`)(sequelize, Sequelize.DataTypes);
    Models[model.name] = model;
  });

// Associate models if associations are defined
Object.values(Models).forEach((model) => {
  if (model.associate) {
    model.associate(Models);
  }
});

module.exports = {
  Models,
  sequelize,
};
