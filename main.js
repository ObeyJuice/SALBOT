//Libraries
const Discord = require('discord.js');
const Mongoose = require('./database/mongoose.js');
const Cron = require("cron");
const fs = require("fs");

// Bot Config
const config = require('./config.json');
const globals = require('./globals.js');
const botData = require('./data.json');

// Bot Modules
const logger = require('./modules/logger.js');
const reactionHandler = require('./modules/reactionHandler.js');
const cronJobs = require('./modules/cronJobs.js');

// Cron jobs
const pruneOrderChannelsJob = new Cron.CronJob('0,10,20,30,40,50 * * * *' /* Every 10 mins */, () => cronJobs.pruneOrderChannels(client));

// Create Discord client
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.commands = new Discord.Collection();

// Event handlers
process.on('uncaughtException', ex => logger.log('error', ex.stack));
process.on('unhandledRejection', ex => logger.log('error', ex.stack));

//client.on('debug', m => logger.log('debug', m));
client.on('warn', m => logger.log('warn', m));
client.on('error', m => logger.log('error', m));
client.on("shardError", () => logger.log('debug', 'Shard error'));
client.on("shardReconnecting", () => logger.log('debug', 'Reconnecting to shard'));
client.on("shardResume", () => logger.log('debug', 'Connected to shard'));

// Discord ready event
client.on('ready', () => {
    logger.log('debug', 'Discord: Ready');

    client.guilds.cache.forEach(guild => {
        logger.log('debug', `Connected to ${guild.name}`);
    })
    
    client.user.setActivity('Use $help');
    //pruneOrderChannelsJob.start();
});

// Discord message event
client.on('message', (message) => {
    if (message.content.substring(0, 1) == config.prefix) {
        logger.log('info', `[#${message.channel.name}] @${message.author.username}: ${message.content}`);

        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);

        const command = client.commands.get(cmd);

        if (command) {
            command.execute(client, message, args);
        }

        if (botData.channels[message.channel.name]) {
            message.delete({ timeout: cmd == 'admin' ? 0 : config.deleteTimeout });
        }
    }
});

// Discord reaction add event
client.on('messageReactionAdd', (reaction, user) => {
    reactionHandler.handle(reaction, user);
});

// Initiate bot
console.log('');
console.log(`  █▀▀ █▀█ █   █▀█ █▀█ ▀█▀ v${config.build.version}`);
console.log(`  ▀▀█ █▀█ █   █▀█ █ █  █  ${config.build.date}`);
console.log(`  ▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀▀▀  ▀ `);
console.log('=====================================');

if (globals.debugMode)
{
    logger.log('debug', 'Debug mode enabled');
}

let files = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

for (const file of files) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

logger.log('debug', `Loaded ${files.length} commands`);

Mongoose.init();
client.login(globals.token);