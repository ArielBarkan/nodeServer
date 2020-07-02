'use strict';

const sequelize = require("../src/db/connection");

module.exports = {
  up: async (queryInterface, Sequelize) => {
   return queryInterface.createTable("senders",{
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
          },
      },
      companyName:{
          type: Sequelize.STRING(20),
          allowNull: false,
      },
      createdAt: Sequelize.DATE(),
      updatedAt: Sequelize.DATE(),
   })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("senders");
  }
};
