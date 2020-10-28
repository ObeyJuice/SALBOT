const Discord = require('discord.js');

const logger = require('../modules/logger.js');
const functions = require('../modules/functions.js');
const models = require('../database/models.js');

const config = require('../config.json');
const botData = require('../data.json');

module.exports = {
    name: 'order',
    execute: async function (client, data, args) {
        var isAdmin = data.guild.members.cache.get(data.author.id).hasPermission('ADMINISTRATOR');

        var buyerId = functions.getUserIdFromMention(args[0]);

        if (buyerId) {
            args = args.splice(1);
            if (!isAdmin) {
                buyerId = data.author.id;
            }
        }
        else {
            buyerId = data.author.id;
        }

        var channel = data.channel.name;
        var quantity = parseInt(args[0]);
        var level = parseInt(args[1]);
        var requestLevel = parseInt(botData.channels[channel]);

        // Wrong channel
        if (!botData.channels[channel]) {
            data.channel.send('**Error**: Please make your order in the appropriate **rs#-orders** channel.');
            return;
        }

        // Wrong format
        if (args.length < 2) {
            data.channel.send('**Error**: Invalid command format, please use `$order <quantity> <level> [comment]`.');
            return;
        }

        // Unsupported level
        if (!level || level < 2 || level > 11) {
            data.channel.send('**Error**: Please specify a valid level for the offered artifacts (2 - 11).');
            return;
        }

        // Check artifact level compatibility
        var levelCheck = (botData.rates[requestLevel] && botData.rates[requestLevel][level]) ? true : false;

        if (level > requestLevel) {
            levelCheck = (botData.rates[level] && botData.rates[level][requestLevel]) ? true : false;
        }

        if (!levelCheck) {
            data.channel.send(`**Error**: Current rates do not allow for **R${level}'s** to be traded for **R${requestLevel}'s**.`);
            return;
        }

        // Check quantity
        if (!quantity || quantity < 1) {
            data.channel.send('**Error**: Please specify a valid quantity of offered artifacts (1 or more).');
            return;
        }

        // Determine request quantity
        var rate = botData.rates[requestLevel][level];
        var requestQuantity = quantity / rate;

        // Check minimum trade quantity
        if (requestQuantity < 1) {
            data.channel.send('**Error**: Not enough artifacts offered, please check trade rates.');
            return;
        }

        // Handle buying with higher level arts
        if (level > requestLevel) {
            rate = botData.rates[level][requestLevel];
            requestQuantity = quantity * rate;
        }

        // Get order id
        var doc = await models.Counter.findOneAndUpdate(
            { name: 'orders' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );

        var orderId = doc.count;

        // Get buyer stats
        var stats = await models.Order.countDocuments(
            {
                $or: [{ buyerId: buyerId }, { sellerId: buyerId }],
                status: 'Complete'
            });

        // Create order message
        var msg = new Discord.MessageEmbed();

        msg.setColor(botData.colors.Blue);
        msg.setDescription(`🔹 Order **#${orderId.toString().padStart(4, '0')}**`);
        msg.setFooter('Open');
        msg.setTimestamp(Date.now());
        msg.addFields(
            { name: 'Buyer', value: `<@${buyerId}> [${stats} orders]` },
            { name: 'Seller', value: `<@&${functions.getRoleByName(data.guild, 'rs' + requestLevel + '-seller').id}>` },
            { name: 'Offer', value: `${quantity}xR${level} ⇄ ${Math.ceil(requestQuantity)}xR${requestLevel}` },
        );

        // Order comment
        args = args.splice(2);
        var comment = args.join(' ');

        if (comment.replace(' ', '') != '') {
            msg.addField('Comment', comment);
        }

        // Send message
        var msgString = ` Order **#${orderId.toString().padStart(4, '0')}** (${msg.fields[2].value}) created. <@${buyerId}>, ${msg.fields[1].value}`;
        var sent = await data.channel.send({ content: msgString, embed: msg });

        // Add order to database
        var order = new models.Order({
            orderId: orderId,
            channelId: sent.channel.id,
            messageId: sent.id,
            buyerId: buyerId,
            sellerId: '',
            offerAmount: quantity,
            offerLevel: level,
            requestAmount: Math.ceil(requestQuantity),
            requestLevel: requestLevel,
            comment: comment,
            createdTimestamp: sent.createdTimestamp
        }).save();

        logger.log('cmd', `[#${data.channel.name}] @${data.author.username} created an order (${quantity}xR${level} : ${Math.ceil(requestQuantity)}xR${requestLevel})`)
    }
}