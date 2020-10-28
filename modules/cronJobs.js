const globals = require('../globals.js');
const logger = require('./logger.js');

module.exports = {
    pruneOrderChannels: async function (client) {

        var messageAgeCutoff = 60 * 60 * 1000; // 1 Hour

        var guild = await client.guilds.cache.get(globals.guildId);

        var count = 0;

        for (i = 2; i <= 11; i++) {
            var channel = await guild.channels.cache.find(c => c.name == `rs${i}-orders`);

            if (channel) {
                var messages = await channel.messages.fetch({ limit: 100 });
                messageList = [];
                messages.forEach(msg => {
                    if (msg.embeds[0] && msg.embeds[0].footer) {
                        if (msg.embeds[0].footer.text.indexOf('Status: ') == -1 && (Date.now() - msg.createdTimestamp) > messageAgeCutoff) {
                            messageList.push(msg)
                            count++;
                        }
                    }
                    else if ((Date.now() - msg.createdTimestamp) > messageAgeCutoff) {
                        messageList.push(msg)
                        count++;
                    }

                });

                await channel.bulkDelete(messageList);
            }
        }
        if (count > 0) {
            logger.log('debug', `[CRON] Deleted ${count} messages from order channels`);
        }
    }
}