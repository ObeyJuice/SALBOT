const Discord = require('discord.js');
const logger = require('../modules/logger.js');
const functions = require('../modules/functions.js');

const mongoose = require('mongoose');
const models = require('../database/models.js');

const config = require('../config.json');
const botData = require('../data.json');

module.exports = {
  name: 'test',
  execute: async function (client, data, args) {
    data.channel.send(functions.getUserIdFromMention(args[0]));
  }
}