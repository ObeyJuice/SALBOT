const Discord = require('discord.js');

const config = require('../config.json');

const botData = require('../data.json');

module.exports = {
    name: 'rates',
    execute: async function (client, data, args) {
        var level = args[0];
        var quantity = args[1] == null ? 1 : args[1];

        var channel = parseInt(botData.channels[data.channel.name]);
        if (channel) {
            level = channel;
            quantity = args[0] == null ? 1 : args[0];
        }

        if (quantity < 0) {
            data.channel.send('Please specify a valid quantity.');
            return;
        }

        if (level >= 2 && level <= 11) {
            var msg = new Discord.MessageEmbed();

            var messageString = '';

            for (i = level - 1; i >= 0; i--) {
                if (botData.rates[level][i] != null) {
                    var rate = parseFloat(botData.rates[level][i] * quantity).toFixed(1);

                    if (i >= 10 && rate >= 10) {
                        messageString += `R${i} .................. ${rate}`;
                    } else if (i >= 10) {
                        messageString += `R${i} ................... ${rate}`;
                    } else if (rate >= 100) {
                        messageString += `R${i} .................. ${rate}`;
                    } else if (rate >= 10) {
                        messageString += `R${i} ................... ${rate}`;
                    } else {
                        messageString += `R${i} .................... ${rate}`;
                    }

                    if (botData.rates[level][i - 1] != null) {
                        messageString += '\r\n';
                    }
                }
            }

            msg.setTitle(`${quantity}xR${level} Rates`);
            msg.setDescription(`\`\`\`${messageString}\`\`\``);
            msg.setFooter(`Weight: ${botData.rates[level].weight} tons\r\n(Rates are based on artifact salvage values)`);

            data.channel.send(msg);
        } else {
            data.channel.send('Please specify a valid artifact level (2 - 11), or use the command in an **rs#-orders** channel.');
        }
    }
}