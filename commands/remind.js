const functions = require('../modules/functions.js');

module.exports = {
    name: 'remind',
    execute: async function (client, data, args) {
        var messageId = args[0];
        var message = await data.channel.messages.fetch(messageId);

        if (message.embeds[0]) {
            if (message.embeds[0].footer.text == 'Status: Accepted') {
                var buyer = message.embeds[0].fields[0].value;
                var seller = message.embeds[0].fields[1].value;
                var order = message.embeds[0].fields[2].value;
                data.channel.send(`[${buyer}, ${seller}] Reminder: your order (${order}) was accepted ${functions.timeSince(message.editedTimestamp)} ago, but has not yet been marked as completed.`);
            }
        }
    }
}