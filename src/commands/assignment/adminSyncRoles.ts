'use strict';

import { Client, Command, GuildStorage } from 'yamdbf';
import { Collection, Message, RichEmbed, Role } from 'discord.js';

export default class SyncRoles extends Command<Client>
{
	public constructor(bot: Client)
	{
		super(bot, {
			name: 'sync',
			description: 'Sync Roles',
			usage: '<prefix>sync',
			extraHelp: 'Use this command to remove any non-existent server roles from the list of allowed roles.',
			group: 'assignment',
			roles: ['The Rocinante'],
			guildOnly: true
		});
	}

	public async action(message: Message, args: string[]): Promise<any>
	{
		// variable declaration
		const guildStorage: GuildStorage = this.client.storage.guilds.get(message.guild.id);
		const availableRoles: Array<any> = await guildStorage.get('Server Roles');
		const serverRoles: Collection<string, Role> = new Collection(Array.from(message.guild.roles.entries()).sort((a: any, b: any) => b[1].position - a[1].position));
		let updatedRoles: any = Array();
		let currentRoles: string = '';
		let removedRoles: string = '';
		const noRoles: RichEmbed = new RichEmbed()
			.setColor(0x206694)
			.setAuthor(message.guild.name + ': Role Synchronization', message.guild.iconURL)
			.addField('Current Allowed Roles', '\nNo roles currently allowed.');

		// make sure there are allowed roles
		if (availableRoles === null)
			return message.channel.sendEmbed(noRoles, '', { disableEveryone: true });

		// iterate through availableRoles, create updated list
		availableRoles.forEach((el: any) => {
			if (serverRoles.find('name', el.name))
			{
				updatedRoles.push(el);
				currentRoles += '\n' + el.name;
			}
			else
				removedRoles += '\n' + el.name;
		});

		// update availableRoles
		guildStorage.set('Server Roles', updatedRoles);

		// make sure there are current roles
		if (currentRoles === '')
			return message.channel.sendEmbed(noRoles, '', { disableEveryone: true });

		// check if there are roles to remove
		if (removedRoles === '')
			removedRoles = '*No roles removed*';

		// build the output embed
		const embed: RichEmbed = new RichEmbed()
			.setColor(0x274E13)
			.setAuthor(message.guild.name + ': Role Synchronization', message.guild.iconURL)
			.addField('Current Allowed Roles', currentRoles)
			.addField('Roles Cleaned from Allowed List', removedRoles);

		// display the list
		return message.channel.sendEmbed(embed, '', { disableEveryone: true });
	}
}
