module.exports = (queryInterface, DataTypes) => {
  const FileMap = queryInterface.define(
    'filemap',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'files', // This references the same table
          key: 'fileId', // The column in the referenced table
        },
      },
      directoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'directories', // This references the same table
          key: 'directoryId', // The column in the referenced table
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accessType: {
        type: DataTypes.ENUM('Public', 'Private', 'Partial'),
        allowNull: false,
      },
      creatorId: {
        type: DataTypes.INTEGER, // Assuming creatorId is an integer
        allowNull: false,
        references: {
          model: 'users', // References the users table
          key: 'userId', // The column in the referenced table
        },
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
  FileMap.associate = (models) => {
    FileMap.belongsTo(models.file, { foreignKey: 'fileId' });

    FileMap.belongsTo(models.directory, { foreignKey: 'directoryId' });

    FileMap.belongsTo(models.user, { foreignKey: 'creatorId' });
  };
  return FileMap;
};
