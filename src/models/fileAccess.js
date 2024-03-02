module.exports = (queryInterface, DataTypes) => {
  const FileAccess = queryInterface.define(
    'fileAccess',
    {
      accessId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fileMapId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      paranoid: false,
      freezeTableName: true, // Disable pluralization of table names
      indexes: [
        {
          unique: true,
          fields: ['fileMapId', 'userId'],
          name: 'idx_unique',
        },
      ],
    },
  );

  // Define associations
  FileAccess.associate = (models) => {
    FileAccess.belongsTo(models.fileMap, { foreignKey: 'fileMapId' });

    FileAccess.belongsTo(models.user, { foreignKey: 'userId' });
  };

  return FileAccess;
};
