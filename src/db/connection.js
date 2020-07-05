const configData = require('../../config/env');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const sequelize = new Sequelize(configData.dbArray.dbName, configData.dbArray.user, configData.dbArray.pass,{
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: 1,
    logging: false
})

module.exports = {sequelize, Op};
global.sequelize = sequelize;
global.Op = Op;