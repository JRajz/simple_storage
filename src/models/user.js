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
