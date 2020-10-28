const Discord = require('discord.js');

const botData = require('../data.json');

const functions = require('./functions.js');

module.exports = {
    handle: async function (reaction, user) {
        try {
            if (user.bot) { return; }

            var r = await reaction.fetch();
            var m = await r.message.fetch(true);
            switch (m.channel.name) {
                case 'seller-roles':
                    embed = m.embeds[0];
                    if (m.author.bot && embed != null) {
                        var regex = RegExp(/RS(\d{1,2}) Sellers:/);
                        var result = regex.exec(embed.title);
                        var level;

                        if (result) {
                            level = result[1];
                        }

                        var role = functions.getRoleByName(m.guild, `rs${level}-seller`);

                        switch (r.emoji.name) {
                            case '✅':
                                // Add seller role to user
                                await m.guild.members.cache.get(user.id).roles.add(role);
                                await m.reactions.resolve('✅').users.remove(user.id);
                                break;
                            case '❌':
                                // Remove seller role from user
                                await m.guild.members.cache.get(user.id).roles.remove(role);
                                await m.reactions.resolve('❌').users.remove(user.id);
                                break;
                        }

                        var msg = new Discord.MessageEmbed();
                        msg.setColor(botData.colors.White);
                        msg.setTitle(`RS${level} Sellers:`);

                        var s = '';
                        role = await functions.getRoleByName(m.guild, `rs${level}-seller`);
                        role.members.forEach(m => {
                            if (m) {
                                s += `<@${m.user.id}>\r\n`;
                            }
                        });

                        msg.setDescription(s);

                        m.edit(msg);
                    }
                    break;
                default:
                    var isAdmin = m.guild.members.cache.get(user.id).hasPermission('ADMINISTRATOR');
                    var edited = false;

                    embed = m.embeds[0];
                    if (m.author.bot && embed != null) {
                        switch (r.emoji.name) {
                            case '✅':
                                // User accepts if not accepted
                                if (embed.footer.text == 'Status: Open') {
                                    if (embed.fields[0].value.indexOf(user.id) == -1) {
                                        embed.setColor(botData.colors.Gold);
                                        embed.fields[1].value = `<@${user.id}>`;
                                        embed.setFooter(`Status: Accepted`);

                                        m.channel.send(`${embed.fields[0].value}, your order (${embed.fields[2].value}) was accepted by <@${user.id}>`);

                                        edited = true;
                                        console.log(`[#${m.channel.name}] [SYSTEM] @${user.username} accepted an order`);
                                    } else {
                                        console.log(`[#${m.channel.name}] [SYSTEM] @${user.username}: tried to accept their own order`);
                                    }
                                } else if (embed.fields[0].value.indexOf(user.id) != -1) {
                                    // Buyer completes if accepted
                                    if (embed.footer.text == 'Status: Accepted') {
                                        embed.setColor(botData.colors.Green);
                                        embed.setFooter('Status: Completed');

                                        edited = true;
                                        console.log(`[#${m.channel.name}] [SYSTEM] @${user.username} completed their order`);
                                    }
                                    // Seller completes if accepted
                                } else if (embed.fields[1].value.indexOf(user.id) != -1) {
                                    if (embed.footer.text == 'Status: Accepted') {
                                        embed.setColor(botData.colors.Green);
                                        embed.setFooter('Status: Completed');

                                        edited = true;
                                        console.log(`[#${m.channel.name}] [SYSTEM] @${user.username} completed an order`);
                                    }
                                }


                                m.reactions.resolve('✅').users.remove(user.id);
                                break;
                            case '❌':
                                console.log('X');
                                // Seller rejects order
                                if (embed.fields[1].value.indexOf(user.id) != -1) {
                                    if (embed.footer.text == 'Status: Accepted') {
                                        var requestLevel = parseInt(channels[m.channel.name]);

                                        embed.setColor(botData.colors.Blue);
                                        embed.fields[1].value = `<@&${functions.getRoleByName(m.guild, 'rs' + requestLevel + '-seller').id}>`;
                                        embed.setFooter(`Status: Open`);

                                        edited = true;
                                        console.log(`[#${m.channel.name}] [SYSTEM] @${user.username} rejected an order`);
                                    }
                                    // Buyer cancels order
                                } else if (embed.fields[0].value.indexOf(user.id) != -1 || isAdmin) {
                                    if (embed.footer.text != 'Status: Completed') {
                                        embed.setColor(botData.colors.Red);
                                        embed.setFooter('Status: Cancelled');
                                        edited = true;
                                        console.log(`[#${m.channel.name}] [SYSTEM] @${user.username} cancelled their order`);
                                    }
                                }

                                m.reactions.resolve('❌').users.remove(user.id);
                                break;
                        }
                    }

                    if (edited) {
                        m.edit(embed);
                    }
            }
        } catch (ex) {
            console.log(`Something went wrong while handling a reaction event:\r\n${ex}`);
        }
    }
}