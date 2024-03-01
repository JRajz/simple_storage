module.exports = (queryInterface, DataTypes) => {
  const File = queryInterface.define(
    'file',
    {
      fileId: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Set fileId as the primary key
        autoIncrement: true, // Assuming fileId is an auto-incrementing integer
      },
      fileHash: {
        type: DataTypes.STRING, // Can be replaced with a unique identifier
        allowNull: false,
        unique: true,
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
      fileSize: {
        type: DataTypes.BIGINT.UNSIGNED,
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

  // Define associations
  File.associate = (models) => {
    File.belongsTo(models.user, { foreignKey: 'creatorId' });

    File.hasMany(models.fileMap, { foreignKey: 'fileId' });

    File.hasMany(models.fileVersion, { foreignKey: 'fileId' });
  };

  return File;
};
