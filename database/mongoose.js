const mongoose = require('mongoose');
const globals = require('../globals.js');
const logger = require('../modules/logger.js');

module.exports = {
    init: () => {
        const dbOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        }

        mongoose.connection.on('connected', () => logger.log('debug', 'MongoDB: Connected'));
        mongoose.connection.on('disconnected', () => logger.log('debug', 'MongoDB: Disconnected'));
        mongoose.connection.on('err', err => logger.log('error', `MongoDB: Error - ${err.stack}`));

        if (globals.debugMode) {
            mongoose.connect('mongodb://localhost:27017/salbot-test', dbOptions);
        }
        else {
            mongoose.connect('mongodb://localhost:27017/salbot', dbOptions);
        }
    }
}