const Sequelize = require('sequelize');


module.exports = sequelize.define("sender", {
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
})