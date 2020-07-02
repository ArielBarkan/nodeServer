const Sequelize = require('sequelize');


module.exports = sequelize.define("courier", {
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
    }
})