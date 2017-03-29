'use strict';
const Bot = require('yamdbf').Bot;
const { DMManager } = require('yamdbf-addon-dm-manager');
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
bot.once('ready', () => { bot.dmManager = new DMManager(bot, '296753647277309972'); });
bot.on('disconnect', () => process.exit());
