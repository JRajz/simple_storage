module.exports = (queryInterface, DataTypes) => {
  const File = queryInterface.define(
    'file',
    {
      fileId: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Set fileId as the primary key
        autoIncrement: true, // Assuming fileId is an auto-incrementing integer
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hashKey: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fileType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      creatorId: {
        type: DataTypes.INTEGER, // Assuming creatorId is an integer
        allowNull: false,
      },
    },
    {
      // Enable soft deletion
      paranoid: true,
    },
  );

  // Define associations
  File.associate = (models) => {
    File.belongsTo(models.user, { foreignKey: 'creatorId' });
  };

  return File;
};
