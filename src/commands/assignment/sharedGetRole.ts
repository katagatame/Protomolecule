'use strict';

import { Client, Command, GuildStorage } from 'yamdbf';
import { GuildMember, Message, RichEmbed, Role } from 'discord.js';
import * as fuzzy from 'fuzzy';
import Assignment from '../../util/assignment';
import Constants from '../../util/constants';

export default class GetRole extends Command<Client>
{
	public constructor(bot: Client)
	{
		super(bot, {
			name: 'gr',
			description: 'Get Role',
			usage: '<prefix>gr <Argument>\u000d	   <prefix>gr <Argument>, <Argument>, ...',
			extraHelp: 'This command will assign a specific role to yourself.\u000d\u000dArgument information below...\u000d\u000dRole Name : The name of the role to be assigned.\u000d\u000d*If Protomolecule tells you to be more specific, type the role as if it were case-sensitive. Protomolecule will then find your specific role.',
			group: 'assignment',
			guildOnly: true
		});
	}

	public async action(message: Message, args: string[]): Promise<any>
	{
		// variable declaration
		const guildStorage: GuildStorage = this.client.storage.guilds.get(message.guild.id);
		let availableRoles: Array<any> = await guildStorage.get('Server Roles');
		let roleArgs: Array<any> = new Array();
		let role: Role;

		// make sure there are allowed roles
		if (availableRoles === null || availableRoles.length === 0)
			return message.channel.sendMessage('There are currently no self-assignable roles.');

		// make sure a role was specified
		if (args.length === 0)
			return message.channel.sendMessage('Please specify a role to assign.');

		// create array from user input
		roleArgs = message.content.match(Constants.cslRegExp);
		roleArgs = roleArgs.map((el: string) => { return el.toString().replace(Constants.getRegExp, ''); });

		// if one role specified
		if (roleArgs.length === 1)
		{
			// if role specified was wildcard
			if (roleArgs[0] === '*.')
			{
				availableRoles.forEach((el: any) => { message.member.addRole(el.id); });
				return message.channel.sendMessage(`\`${availableRoles.map((el: any) => { return el.name; }).join('`, `')}\` successfully assigned.`);
			}

			// search for role
			let options: any = { extract: (el: any) => { return el.name; } };
			let results: any = fuzzy.filter(roleArgs[0], availableRoles, options);

			// check if role is valid
			if (results.length === 0)
				return message.channel.sendMessage(`\`${roleArgs[0]}\` is not a valid role.`);

			// assign role
			if (results.length === 1)
			{
				// try to find user
				message.guild.fetchMember(message.author.id).then((user: GuildMember) => {
					user.addRole(results[0].original.id);
					return message.channel.sendMessage(`\`${results[0].original.name}\` successfully assigned.`);
				}).catch((err: any) => {
					return message.channel.sendMessage(`User could not be found.`);
				});
			}

			// more than one role found
			if (results.length > 1)
			{
				// check if roleArg is specifically typed
				if (Assignment.isSpecificResult(results, roleArgs[0]))
				{
					// grab the role to be assigned
					role = message.guild.roles.find('name', Assignment.getSpecificRoleName(results, roleArgs[0]));

					// try to find user
					message.guild.fetchMember(message.author.id).then((user: GuildMember) => {
						user.addRole(role);
						return message.channel.sendMessage(`\`${role.name}\` successfully assigned.`);
					}).catch((err: any) => {
						return message.channel.sendMessage(`User could not be found.`);
					});
				}
				else
					// be more specific
					return message.channel.sendMessage(`More than one role found: \`${results.map((el: any) => { return el.string; }).join(', ')}\`,  please be more specific.`);
			}
		}

		// if more than one role specified
		if (roleArgs.length > 1)
		{
			// variable declaration
			let invalidRoles: Array<string> = new Array();
			let validRoles: Array<Role> = new Array();
			const embed: RichEmbed = new RichEmbed();

			roleArgs.forEach((el: any) => {
				// search for role
				let options: any = { extract: (r: any) => { return r.name; } };
				let results: any = fuzzy.filter(el, availableRoles, options);

				// check if role is valid
				if (results.length === 0)
					invalidRoles.push(el);

				// assign role
				if (results.length === 1)
				{
					// role from result
					role = message.guild.roles.get(results[0].original.id);
					validRoles.push(role);
				}

				// more than one role found
				if (results.length > 1)
				{
					// check if roleArg is specifically typed
					if (Assignment.isSpecificResult(results, el))
					{
						// grab the role to be assigned
						role = message.guild.roles.find('name', Assignment.getSpecificRoleName(results, el));
						validRoles.push(role);
					}
					else
						// be more specific
						return message.channel.sendMessage(`More than one role found: \`${results.map((r: any) => { return r.string; }).join(', ')}\`,  please be more specific.`);
				}
			});

			// assign roles
			validRoles.forEach((el: Role) => { message.guild.member(message.author.id).addRole(el); });

			// build output embed
			embed
				.setColor(0x206694)
				.setTitle(message.guild.name + ': Roles Update')
				.addField('Assigned Roles', validRoles.join('\n') ? validRoles.join('\n') : '\u200b', true)
				.addField('Invalid Roles', invalidRoles.join('\n') ? invalidRoles.join('\n') : '\u200b', true)
				.setDescription('Invalid Roles are either already allowed, incorrectly typed, or not a current server role.');

			// display output embed
			return message.channel.sendEmbed(embed, '', { disableEveryone: true });
		}
	}
}
