const Sequelize = require('sequelize');
const dateFormat = require('dateformat')
module.exports = sequelize.define("delivery", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    packageSize:{
        type: Sequelize.INTEGER(10),
        allowNull: false,

    },
    cost:{
        type: Sequelize.INTEGER(10),
        allowNull: false,
    },
    description:{
        type: Sequelize.TEXT,
    },
    date:{
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          isAfter: Sequelize.NOW
        },
        get: function() {
          return dateFormat(this.getDataValue('date'), "isoDate")
       }
    },
    isCompleted:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    senderId:{
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
    },
    courierId:{
        type: Sequelize.INTEGER(11),
        references: {
            model: 'users',
            key: 'id'
        },
    }
})