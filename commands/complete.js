const logger = require('../modules/logger.js');
const models = require('../database/models.js');

const globals = require('../globals.js');
const botData = require('../data.json');

module.exports = {
    name: 'complete',
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

        if ((data.author.id == order.buyerId || data.author.id == order.sellerId) && order.status == 'Accepted') {
            // Get order message
            var guild = await client.guilds.cache.get(globals.guildId);
            var channel = await guild.channels.cache.get(order.channelId);
            var message = await channel.messages.fetch(order.messageId);
            var embed = message.embeds[0];

            // Delete old order message
            message.delete();

            // Modify message embed
            embed.setColor(botData.colors.Green);
            embed.setFooter('Complete');
            embed.setTimestamp(Date.now());

            // Send new message to front of channel
            var msgString = ` Order **#${order.orderId.toString().padStart(4, '0')}** (${embed.fields[2].value}) completed. <@${order.buyerId}>, <@${order.sellerId}>`;
            var newMsg = await data.channel.send({ content: msgString, embed: embed });

            // Update order in DB
            order.status = 'Complete';
            order.messageId = newMsg.id;
            order.completedTimestamp = embed.timestamp;
            order.save();

            logger.log('cmd', `[#${data.channel.name}] @${data.author.username} completed an order`)
        }
        else {
            logger.log('cmd', `[#${data.channel.name}] @${data.author.username} tried to complete an order`)
        }
    }
}