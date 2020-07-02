const Sequelize = require('sequelize');


module.exports = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    username:{
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
    },
    password:{
        type: Sequelize.TEXT(),
        allowNull: false
    },
    group:{
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },
    tokenSecret:{
        type: Sequelize.TEXT
    }
})