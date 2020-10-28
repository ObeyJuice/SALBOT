module.exports = {
    getDisplayNameById: function (guild, id) {
        return guild.members.cache.get(id).displayName;
    },

    getUserByDisplayName: function (guild, displayName) {
        return guild.members.cache.find(u => u.displayName == displayName);
    },

    getRoleByName: function (guild, name) {
        return guild.roles.cache.find(r => r.name == name);
    },

    getUserIdFromMention: function(mention) {
        var regex = RegExp(/<@!(\d+)>/);
        var result = regex.exec(mention);
        if (result) {
            return result[1];
        }
        return null;
    },

    timeSince: function (date) {

        var seconds = Math.floor((new Date() - date) / 1000);

        var interval = seconds / 31536000;

        if (interval > 1) {
            return Math.floor(interval) + " years";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " months";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " days";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " hours";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    }
}