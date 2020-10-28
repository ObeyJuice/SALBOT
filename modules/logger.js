const Winston = require('winston');
require('winston-daily-rotate-file');

const logLevels = {
    levels: {
        error: 1,
        warn: 2,
        cmd: 3,
        info: 4,
        debug: 5
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        cmd: 'magenta',
        info: 'cyan',
        debug: 'green'
    }
}

const logFormat = Winston.format.printf(log => `[${log.level}][${log.timestamp}] ${log.message}`);

const winston = Winston.createLogger({
    levels: logLevels.levels,
    transports: [
        new Winston.transports.Console({
            level: 'debug',
            format:
                Winston.format.combine(
                    Winston.format.colorize(),
                    Winston.format.timestamp({ format: 'h:mma' }),
                    logFormat
                )
        }),
        new (Winston.transports.DailyRotateFile)({
            filename: './logs/%DATE%.log',
            datePattern: 'DD-MM-yyyy',
            prepend: true,
            level: 'debug',
            format:
                Winston.format.combine(
                    Winston.format.timestamp({ format: 'HH:mm:ss' }),
                    logFormat
                )
        })
    ]
});

Winston.addColors(logLevels.colors);

module.exports = {
    log: function (level, message) {
        winston.log(level, message);
    }
}