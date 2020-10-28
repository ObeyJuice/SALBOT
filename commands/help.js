const Discord = require('discord.js');

const config = require('../config.json');

const botData = require('../data.json');

module.exports = {
    name: 'help',
    execute: async function (client, data, args) {
        var helpMessage = new Discord.MessageEmbed();
        helpMessage.setTitle('Bot Commands:');
        helpMessage.setDescription(botData.strings.help.join('\n'));
        helpMessage.setFooter(`SALBOT v${config.build.version} (${config.build.date})`);
        data.channel.send(helpMessage);
    }
}