'use strict';
const Bot = require('yamdbf').Bot;
const config = require('./config.json');
const path = require('path');
const bot = new Bot({
    name: config.name,
    token: config.token,
    config: config,
    selfbot: false,
    version: config.version,
    statusText: config.status,
    commandsDir: path.join(__dirname, 'commands'),
    disableBase: [
        'disablegroup',
        'enablegroup',
        'listgroups',
        'limit',
        'clearlimit',
        'version',
        'reload',
        'eval',
        'ping'
    ]
})
.setDefaultSetting('prefix', '.')
.start();

bot.on('ready', () => bot.user.setAvatar('./img/avatar.jpg'));
bot.on('disconnect', () => process.exit());
