module.exports = (queryInterface, DataTypes) => {
  const Directory = queryInterface.define(
    'directory',
    {
      directoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Set fileId as the primary key
        autoIncrement: true, // Assuming fileId is an auto-incrementing integer
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      parentDirectoryId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for root directory
        references: {
          model: 'directories', // This references the same table
          key: 'directoryId', // The column in the referenced table
        },
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
        beforeUpdate: (instance, options) => {
          // Update only updatedAt, leaving createdAt untouched
          // eslint-disable-next-line no-param-reassign
          instance.updatedAt = new Date();
        },
      },
    },
  );

  // Define associations
  Directory.associate = (models) => {
    // One-to-one relationship between a directory and its creator user
    Directory.belongsTo(models.user, { foreignKey: 'creatorId', as: 'Creator' });

    // One-to-one relationship between a directory and its parent directory
    Directory.hasOne(models.directory, { foreignKey: 'parentDirectoryId', as: 'Parent' });
    models.directory.belongsTo(models.directory, { foreignKey: 'parentDirectoryId' });
  };
  return Directory;
};
