module.exports = (queryInterface, DataTypes) => {
  const FileVersion = queryInterface.define(
    'fileVersion',
    {
      versionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fileMapId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      paranoid: false,
    },
  );

  // Define associations
  FileVersion.associate = (models) => {
    FileVersion.belongsTo(models.fileMap, { foreignKey: 'fileMapId' });

    FileVersion.belongsTo(models.file, { foreignKey: 'fileId' });
  };

  return FileVersion;
};
