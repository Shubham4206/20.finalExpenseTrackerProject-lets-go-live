const Sequelize = require('sequelize');

const data_base = require('../util/database');

const Premiumuser = data_base.define('premiumuser', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    paymentId: Sequelize.STRING,
    orderId: Sequelize.STRING,
    status: Sequelize.STRING
});

module.exports = Premiumuser;