'use strict';

import { Client, Command } from 'yamdbf';
import { Collection, Guild, GuildMember, Message, RichEmbed, Role } from 'discord.js';
import * as moment from 'moment';

export default class UserStats extends Command<Client>
{
	public constructor(bot: Client)
	{
		super(bot, {
			name: 'ss',
			description: 'Server Stats',
			usage: '<prefix>ss <Argument>?',
			extraHelp: 'This command returns information regarding The Churn Discord.\u000d\u000dArgument information below...\u000d\u000droles : Return a list of roles and their member count.\u000d\u000d*Running the command without an argument returns Server Information.',
			group: 'stats',
			roles: ['The Rocinante'],
			guildOnly: true
		});
	}

	public action(message: Message, args: string[]): Promise<any>
	{
		// variable declaration
		const server: Guild = message.guild;
		const serverRoles: Collection<string, Role> = new Collection(Array.from(server.roles.entries()).sort((a: any, b: any) => b[1].position - a[1].position));
		const embed: RichEmbed = new RichEmbed()
			.setColor(0x206694)
			.setAuthor(server.name + ' Stats', server.iconURL);

		// evaluate the query
		switch (args.join(' '))
		{
			case 'roles':
				let sRoles: Array<string> = new Array();
				let sRoleSize: Array<string> = new Array();

				serverRoles.forEach((el: Role) => {
					if (el.name !== '@everyone' && el.managed === false)
					{
						sRoles.push(el.name);
						sRoleSize.push(el.members.size.toString());
					}
				});

				embed
					.addField('Roles', sRoles.join('\n'), true)
					.addField('Members', sRoleSize.join('\n'), true);

				return message.channel.sendEmbed(embed, '', { disableEveryone: true });

			default:
				const serverCreated: string = moment(server.createdAt).format('lll') + '\n*' + moment(new Date()).diff(server.createdAt, 'days') + ' days ago*';
				let online: Collection<string, GuildMember> = server.members.filter((el: GuildMember) => {
					if (!el.user.bot && el.presence.status !== 'offline')
						return true;
				});

				embed
					.addField('Members',
						online.size.toString() + ' Online\n' +
						(server.memberCount - online.size).toString() + ' Offline\n**' +
						server.memberCount + ' Total**', true)
					.addField('Roles', server.roles.filter((el: Role) => { if (el.name !== '@everyone') return true; }).size, true)
					.addField('Channels', server.channels.size.toString(), true)
					.addField('Server Created', serverCreated, true);

				return message.channel.sendEmbed(embed, '', { disableEveryone: true });
		}
	}
}
