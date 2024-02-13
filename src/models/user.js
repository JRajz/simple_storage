module.exports = (queryInterface, DataTypes) => {
  const User = queryInterface.define(
    'user',
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
      // Enable soft deletion
      paranoid: true,
    },
  );

  return User;
};
