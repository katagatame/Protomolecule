'use strict';

import { Client, Command, GuildStorage } from 'yamdbf';
import { Collection, Message, RichEmbed, Role } from 'discord.js';
import Assignment from '../../util/assignment';

export default class ListRoles extends Command<Client>
{
	public constructor(bot: Client)
	{
		super(bot, {
			name: 'list',
			aliases: ['l'],
			description: 'List Roles',
			usage: '<prefix>list\u000d	   <prefix>l',
			extraHelp: 'Use this command to display a list of roles.',
			group: 'assignment',
			guildOnly: true
		});
	}

	public async action(message: Message, args: string[]): Promise<any>
	{
		// variable declaration
		const guildStorage: GuildStorage = this.client.storage.guilds.get(message.guild.id);
		let availableRoles: Array<any> = await guildStorage.get('Server Roles');
		const serverRoles: Collection<string, Role> = new Collection(Array.from(message.guild.roles.entries()).sort((a: any, b: any) => b[1].position - a[1].position));
		let adminCommandRole: Role = message.guild.roles.find('name', 'The Rocinante');
		let leftCol: string = String();
		let rightCol: string = String();
		const noRoles: RichEmbed = new RichEmbed()
			.setColor(0x206694)
			.setTitle(message.guild.name + ': Role Synchronization')
			.addField('Current Allowed Roles', '\nNo roles currently allowed.');

		message.channel.startTyping();

		if (adminCommandRole !== undefined && message.member.roles.find('name', adminCommandRole.name))
		{
			// make sure admin role isn't the lowest in the list
			if (adminCommandRole.position === 1)
			{
				message.channel.sendMessage('Please make sure your admin role isn\'t the lowest in the list.');
				return message.channel.stopTyping();
			}

			// iterate through server roles to build leftCol/rightCol
			serverRoles.forEach((el: Role) => {
				// grab all roles below Admin Role, exclude @everyone and bots
				if (el.position < adminCommandRole.position && el.name !== '@everyone' && el.managed === false)
				{
					leftCol += '\n' + el.name;
					rightCol += (Assignment.existsInArray(availableRoles, el.name)) ? '\n**Allowed**' : '\nNot Allowed';
				}
			});

			// build the output embed
			const modEmbed: RichEmbed = new RichEmbed()
				.setColor(0x274E13)
				.setAuthor(message.guild.name + ': List of Roles', message.guild.iconURL)
				.addField('Roles', leftCol, true)
				.addField('Status', rightCol, true);

			// display the list
			message.channel.sendEmbed(modEmbed, '', { disableEveryone: true });
			return message.channel.stopTyping();
		}
		else
		{
			if (availableRoles === [] || availableRoles === null)
			{
				message.channel.sendEmbed(noRoles, '', { disableEveryone: true });
				return message.channel.stopTyping();
			}

			// iterate through server roles to build leftCol
			availableRoles.forEach((el: any) => leftCol += '\n' + el.name);

			// build the output embed
			const userEmbed: RichEmbed = new RichEmbed()
				.setColor(0x274E13)
				.setAuthor(message.guild.name + ': List of Roles', message.guild.iconURL)
				.setDescription('Run `.gr *.` to get all available roles.')
				.addField('Roles', leftCol, true);

			// display the list
			message.channel.sendEmbed(userEmbed, '', { disableEveryone: true });
			return message.channel.stopTyping();
		}
	}
}
