'use strict';

import { Client, Command, GuildStorage } from 'yamdbf';
import { Message, RichEmbed, Role } from 'discord.js';
import * as fuzzy from 'fuzzy';
import Assignment from '../../util/assignment';
import Constants from '../../util/constants';

export default class AllowRole extends Command<Client>
{
	public constructor(bot: Client)
	{
		super(bot, {
			name: 'allow',
			aliases: ['a'],
			description: 'Allow Role',
			usage: '<prefix>allow <Argument>\u000d	   <prefix>allow <Argument>, <Argument>, ...\u000d	   <prefix>a <Argument>\u000d	   <prefix>a <Argument>, <Argument>, ...\u000d',
			extraHelp: 'This command will allow a specific role to be self-assignable, via the Get Role command.\u000d\u000dArgument information below...\u000d\u000dRole Name : The name of the role to be allowed.\u000d\u000d*If Protomolecule tells you to be more specific, type the role as if it were case-sensitive. Protomolecule will then find your specific role.',
			group: 'assignment',
			roles: ['The Rocinante'],
			guildOnly: true
		});
	}

	public async action(message: Message, args: string[]): Promise<any>
	{
		// variable declaration
		const guildStorage: GuildStorage = this.client.storage.guilds.get(message.guild.id);
		const serverRolesArray: Array<[string, Role]> = Array.from(message.guild.roles.entries());
		let availableRoles: Array<any> = await guildStorage.get('Server Roles');
		let adminCommandRole: Role = message.guild.roles.find('name', 'The Rocinante');
		let roleArgs: Array<any> = new Array();
		let role: Role;

		// make sure a role was specified
		if (args.length === 0)
			return message.channel.sendMessage('Please specify a role to allow.');

		// create array from user input
		roleArgs = message.content.match(Constants.cslRegExp);
		roleArgs = roleArgs.map((el: string) => { return el.toString().replace(Constants.allowRegExp, ''); });

		// map roles
		let roleMap: any = serverRolesArray.filter((el: any) => {
			if (el[1].position < adminCommandRole.position && el[1].name !== '@everyone' && el[1].managed === false)
				return el[1];
		});

		// if one role specified
		if (roleArgs.length === 1)
		{
			// search for role
			let options: any = { extract: (el: any) => { return el[1].name; } };
			let results: Array<any> = fuzzy.filter(roleArgs[0], roleMap, options);

			// check if role is valid
			if (results.length === 0)
				return message.channel.sendMessage(`\`${roleArgs[0]}\` is not a valid role.`);

			// allow role
			if (results.length === 1)
			{
				// role from result
				role = results[0].original[1];

				// check if role already is allowed
				if (Assignment.doesRoleExist(availableRoles, role))
					return message.channel.sendMessage(`\`${role.name}\` is already an allowed role.`);

				// update roles
				Assignment.updateRoles(availableRoles, guildStorage, role);
				return message.channel.sendMessage(`\`${role.name}\` successfully allowed.`);
			}

			// more than one role found
			if (results.length > 1)
			{
				// check if roleArg is specifically typed
				if (Assignment.isSpecificResult(results, roleArgs[0]))
				{
					// role from roleArg
					role = Assignment.getSpecificRole(results, roleArgs[0]);

					// check if role already is allowed
					if (Assignment.doesRoleExist(availableRoles, role))
						return message.channel.sendMessage(`\`${role.name}\` is already an allowed role.`);

					// update roles
					Assignment.updateRoles(availableRoles, guildStorage, role);
					return message.channel.sendMessage(`\`${role.name}\` successfully allowed.`);
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
				let options: any = { extract: (r: any) => { return r[1].name; } };
				let results: Array<any> = fuzzy.filter(el, roleMap, options);

				// check if role is valid
				if (results.length === 0)
					invalidRoles.push(el);

				// if one role found
				if (results.length === 1)
				{
					// role from result
					role = results[0].original[1];

					// check if role already is allowed
					if (Assignment.doesRoleExist(availableRoles, role))
						// add role to invalid array
						invalidRoles.push(el);
					else
						// add role to valid array
						validRoles.push(role);
				}

				// if more than one role found
				if (results.length > 1)
				{
					// check if roleArg is specifically typed
					if (Assignment.isSpecificResult(results, el))
					{
						// role from roleArg
						role = Assignment.getSpecificRole(results, el);

						// check if role already is allowed
						if (Assignment.doesRoleExist(availableRoles, role))
							invalidRoles.push(role.name);

						// add role to valid array
						validRoles.push(role);
					}
					else
						// add inspecific results to invalid array
						results.forEach((r: any) => { invalidRoles.push(r.string); });
				}
			});

			// update roles
			validRoles.forEach((el: Role) => { Assignment.updateRoles(availableRoles, guildStorage, el); });

			// build output embed
			embed
				.setColor(0x206694)
				.setTitle(message.guild.name + ': Roles Update')
				.addField('Allowed Roles', validRoles.join('\n') ? validRoles.join('\n') : '\u200b', true)
				.addField('Invalid Roles', invalidRoles.join('\n') ? invalidRoles.join('\n') : '\u200b', true)
				.setDescription('Invalid Roles are either already allowed, incorrectly typed, or not a current server role.');

			// display output embed
			return message.channel.sendEmbed(embed, '', { disableEveryone: true });
		}
	}
}
