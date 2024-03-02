module.exports = (queryInterface, DataTypes) => {
  const User = queryInterface.define(
    'user',
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Set fileId as the primary key
        autoIncrement: true, // Assuming fileId is an auto-incrementing integer
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      paranoid: true, // Enable soft deletion
      hooks: {
        // eslint-disable-next-line no-unused-vars
        beforeUpdate: (instance, options) => {
          // Update only updatedAt, leaving createdAt untouched
          // eslint-disable-next-line no-param-reassign
          instance.updatedAt = new Date();
        },
      },
    },
  );

  User.associate = (models) => {
    User.hasMany(models.directory, { foreignKey: 'creatorId' });
    User.hasMany(models.fileMap, { foreignKey: 'creatorId' });
    User.hasMany(models.fileAccess, { foreignKey: 'userId' });
  };

  return User;
};
