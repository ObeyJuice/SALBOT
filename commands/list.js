const Discord = require('discord.js');

const globals = require('../globals.js');
const botData = require('../data.json');

const models = require('../database/models.js');

const functions = require('../modules/functions.js');
const { DiscordAPIError } = require('discord.js');

module.exports = {
    name: 'list',
    execute: async function (client, data, args) {
        var level = parseInt(botData.channels[data.channel.name]);

        if (!level) {
            data.channel.send('Error: invalid channel. Please use the **$list** command in the **rs#-orders** channels.');
            return;
        }

        var orders = await models.Order.find(
            {
                requestLevel: level,
                status: 'Open'
            });

        var messageString = `${orders.length} orders found...\n\n`;

        orders.forEach(order => {
            var member = data.guild.members.cache.get(order.buyerId);

            var name = member.nickname;
            if (!name) { 
                name = member.user.username; 
            }

            messageString += `**#${order.orderId.toString().padStart(4, '0')} by ${name} (${functions.timeSince(order.createdTimestamp)} ago)**\n`
                + `[${order.offerAmount}x${order.offerLevel} ⇄ ${order.requestAmount}x${order.requestLevel}]`
                + (order.comment != '' ? ` - ${order.comment}\n` : '\n')
                + '\n'
        });

        if (orders.length == 0) {
            data.channel.send('No open orders were found.');
        }
        else {
            var msg = new Discord.MessageEmbed();

            msg.setTitle(`List of open R${level} orders`)
            msg.setDescription(messageString);
            
            data.channel.send(msg);
        }
    }
}