const logger = require('../modules/logger.js');
const models = require('../database/models.js');

const globals = require('../globals.js');
const botData = require('../data.json');

const functions = require('../modules/functions.js');

module.exports = {
    name: 'reject',
    execute: async function (client, data, args) {
        var orderId = parseInt(args[0]);

        if (!orderId) {
            data.channel.send(`Error: "${args[0]}" is not a valid order ID.`);
            return;
        }

        var order = await models.Order.findOne({ orderId: orderId });

        if (!order) {
            data.channel.send(`Error: Could not find order #${orderId} in the database.`);
            return;
        }

        if (order.channelId != data.channel.id) {
            data.channel.send('Error: Could not find an order with that ID in this channel.');
            return;
        }

        if (order.status == 'Accepted') {
            if(order.sellerId != data.author.id) {
                logger.log('cmd', `[#${data.channel.name}] @${data.author.username} tried to reject someone elses order`)
                return;
            }
            // Get order message
            var guild = await client.guilds.cache.get(globals.guildId);
            var channel = await guild.channels.cache.get(order.channelId);
            var message = await channel.messages.fetch(order.messageId);
            var embed = message.embeds[0];

            // Delete old order message
            message.delete();

            // Modify message embed
            embed.setColor(botData.colors.Blue);
            embed.setFooter('Open');
            embed.setTimestamp(Date.now());
            embed.fields[1].value = `<@&${functions.getRoleByName(data.guild, 'rs' + order.requestLevel + '-seller').id}>`;

            // Send new message to front of channel
            var msgString = ` Order **#${order.orderId.toString().padStart(4, '0')}** (${embed.fields[2].value}) created. <@${order.buyerId}>, ${embed.fields[1].value}`;
            var newMsg = await data.channel.send({ content: msgString, embed: embed });

            // Update order in DB
            order.status = 'Open';
            order.messageId = newMsg.id;
            order.sellerId = '';
            order.acceptedTimestamp = -1;
            order.save();

            // Nofity buyer
            logger.log('cmd', `[#${data.channel.name}] @${data.author.username} rejected an order`)
        }
        else {
            logger.log('cmd', `[#${data.channel.name}] @${data.author.username} tried to reject an order`)
        }
    }
}