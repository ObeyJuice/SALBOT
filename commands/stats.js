const Discord = require('discord.js');

const functions = require('../modules/functions.js');

const models = require('../database/models.js');

module.exports = {
    name: 'stats',
    execute: async function (client, data, args) {
    var member = data.member;
    var userId = data.member.id;

    if (args[0]) {
      var id = functions.getUserIdFromMention(args[0]);
      var _member = data.guild.members.cache.get(id);
      if (_member) {
        member = _member;
        userId = member.id;
      }
    }

    var boughtArts = 0;
    var buyOrders = 0;
    var soldArts = 0;
    var sellOrders = 0;

    var stats = await models.Order.find(
      {
          $or: [{ buyerId: userId }, { sellerId: userId }],
          status: 'Complete'
      });

      stats.forEach(order => {
        if (order.buyerId == member.id)
        {
          buyOrders++;
          boughtArts += order.offerAmount;
        }
        if (order.sellerId == member.id)
        {
          sellOrders++;
          soldArts += order.requestAmount;
        }
      });

    var msg = new Discord.MessageEmbed();

    var name = member.nickname;
    if (!name) { 
        name = member.user.username; 
    }

    msg.setAuthor(`Stats for ${name}`, member.user.avatarURL());
    msg.setDescription(`**${boughtArts}** artifacts bought in **${buyOrders}** orders.\n**${soldArts}** artifacts sold in **${sellOrders}** orders.`);
    data.channel.send(msg);

  }
}