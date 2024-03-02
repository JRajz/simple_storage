module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'directories',
      [
        {
          directoryId: 1,
          name: 'Direct 1',
          parentDirectoryId: null,
          creatorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Sub Directory 1',
          parentDirectoryId: 1,
          creatorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Sub Directory 2',
          parentDirectoryId: 1,
          creatorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('directory', null, {});
  },
};
