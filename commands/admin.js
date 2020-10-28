const Discord = require('discord.js');

const logger = require('../modules/logger.js');
const models = require('../database/models.js');

const globals = require('../globals.js');

const botData = require('../data.json');

module.exports = {
    name: 'admin',
    execute: async function (client, data, args) {
        var isAdmin = data.guild.members.cache.get(data.author.id).hasPermission('ADMINISTRATOR');

        if (isAdmin) {
            switch (args[0]) {
                case 'delete': {
                    var order = await models.Order.findOne({ orderId: args[1] });

                    try {
                        var guild = await client.guilds.cache.get(globals.guildId);
                        var channel = await guild.channels.cache.get(order.channelId);
                        var message = await channel.messages.fetch(order.messageId);
                        
                        message.delete();
                        logger.log('cmd', `Order #${args[1]} message was deleted`);
                    } catch {}
                    
                    if (order) {
                        order.deleteOne();
                        logger.log('cmd', `Order #${args[1]} DB entry was deleted`);
                    }
                    
                    break;
                }
                case 'setuproles': {
                    try {
                        if (data.channel.name == 'roles') {
                            for (i = 3; i <= 11; i++) {

                                var msg = new Discord.MessageEmbed();

                                msg.setColor(botData.colors.White);
                                msg.setTitle(`RS${i} Sellers:`);

                                var s = '';

                                var role = data.guild.roles.cache.find(r => r.name == `rs${i}-seller`);
                                if (role) {
                                    role.members.forEach(m => {
                                        if (m) {
                                            s += `<@${m.user.id}>\r\n`;
                                        }
                                    });

                                    msg.setDescription(s);

                                    var m = await data.channel.send(msg);
                                    await m.react('✅');
                                    await m.react('❌');
                                }
                            }
                        }
                    } catch (ex) {
                        console.log(`${ex}`);
                    }
                    break;
                }
                case 'clear':
                    {
                        try {
                            var messages = await data.channel.messages.fetch({ limit: 100 });
                            if (args[1] == "all") {
                                await data.channel.bulkDelete(messages);
                            }
                            else {
                                var dayMillis = ((60 * 60) * 24) * 1000;

                                messageList = [];
                                messages.forEach(msg => {
                                    if (msg.author.id != globals.clientId && (Date.now() - msg.createdTimestamp) > dayMillis) {
                                        messageList.push(msg)
                                    }
                                });
                                console.log(`Clearing ${messageList.length} messages...`)
                                data.channel.bulkDelete(messageList);
                                console.log('Done!');
                            }
                        } catch (ex) {
                            console.log(`${ex.message}`);
                        }
                        break;
                    }
            }
        }
    }
}