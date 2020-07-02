'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("couriers",{
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER(11),
        references: {
            model: 'users',
            key: 'id'
        }
    },
    firstName:{
        type: Sequelize.STRING(20),
        allowNull: false,
    },
    lastName:{
        type: Sequelize.STRING(20),
        allowNull: false,
    },
    phoneNumber:{
        type: Sequelize.INTEGER(12),
        allowNull: false,
    },
    vehicleType:{
        type: Sequelize.INTEGER(11)
    },
    createdAt: Sequelize.DATE(),
    updatedAt: Sequelize.DATE(),
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("couriers");
  }
};
