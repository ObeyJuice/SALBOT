const config = require('./config.json');

const _debugMode = false;

const _token = _debugMode ? config.debug.token : config.public.token;
const _clientId = _debugMode ? config.debug.clientId : config.public.clientId;
const _guildId = _debugMode ? config.debug.guildId : config.public.guildId;


module.exports = {
    debugMode: _debugMode,
    token: _token,
    clientId: _clientId,
    guildId: _guildId
}