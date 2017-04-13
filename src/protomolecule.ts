'use strict';

import { LogLevel } from 'yamdbf';

const Client: any = require('yamdbf').Client;
const { DMManager } = require('yamdbf-addon-dm-manager');
const config: any = require('./config.json');
const path: any = require('path');
const client: any = new Client({
	name: config.name,
	token: config.token,
	config: config,
	selfbot: false,
	logLevel: LogLevel.INFO,
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
.start();

client.on('waiting', async () => {
	await client.setDefaultSetting('prefix', '.');
	client.emit('finished');
});

client.once('clientReady', () => {
	client.dmManager = new DMManager(client, 'xxx');
});

client.on('disconnect', () => process.exit());
