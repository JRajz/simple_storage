module.exports = (queryInterface, DataTypes) => {
  const FileMap = queryInterface.define(
    'fileMap',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      directoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
        type: DataTypes.ENUM('public', 'private', 'partial'),
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
      indexes: [
        {
          fields: ['creatorId'],
          name: 'idx_creator',
        },
        {
          unique: true,
          fields: ['fileId', 'directoryId'],
          name: 'idx_unique',
        },
      ],
    },
  );

  // Define associations
  FileMap.associate = (models) => {
    FileMap.belongsTo(models.file, { foreignKey: 'fileId' });

    FileMap.belongsTo(models.directory, { foreignKey: 'directoryId' });

    FileMap.belongsTo(models.user, { foreignKey: 'creatorId' });

    FileMap.hasMany(models.fileAccess, { foreignKey: 'fileMapId' });
  };
  return FileMap;
};
