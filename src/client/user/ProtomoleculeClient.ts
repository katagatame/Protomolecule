import { Client, ListenerUtil, LogLevel } from '@yamdbf/core';

import DiscordConfig from '../../lib/interfaces/Config';
import config = require('./config/user-config.json');

const { once } = ListenerUtil;

/**
 * @class ProtomoleculeClient
 * @description This class represents the heart of the Protomolecule.
 * @extends Client
 */
export default class ProtomoleculeClient extends Client {
	public readonly config: DiscordConfig;

	public constructor() {
		super({
			token: config.token,
			owner: config.owner,
			statusText: config.status,
			commandsDir: './client/commands',
			disableBase: [
				'eval',
				'eval:ts',
				'ping',
				'setlang',
				'setprefix',
				'shortcuts'
			],
			logLevel: LogLevel.DEBUG,
			readyText: 'Ready\u0007',
			ratelimit: '10/1m',
			pause: true
		});
		this.config = config;
	}

	/**
	 * @async
	 * @method _onPause
	 * @description Listener for the `pause` event.
	 * @listens pause
	 *
	 * @memberof ProtomoleculeClient
	 */
	@once('pause')
	public async _onPause(): Promise<void> {
		/** Ensure Aeden's default prefix is always `.` */
		await this.setDefaultSetting('prefix', '.');

		this.emit('continue');
	}

	/**
	 * @async
	 * @method _onClientReady
	 * @description Listener for the `clientReady` event.
	 * @listens clientReady
	 *
	 * @memberof ProtomoleculeClient
	 */
	@once('clientReady')
	public async _onClientReady(): Promise<void> {}

	/**
	 * @async
	 * @method _onDisconnect
	 * @description Listener for the `disconnect` event.
	 * @listens disconnect
	 *
	 * @memberof ProtomoleculeClient
	 */
	@once('disconnect')
	public async _onDisconnect(): Promise<void> {
		process.exit(100);
	}
}
