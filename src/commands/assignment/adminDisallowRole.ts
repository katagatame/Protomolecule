'use strict';

import { Client, Command, GuildStorage } from 'yamdbf';
import { Message, RichEmbed, Role } from 'discord.js';
import * as fuzzy from 'fuzzy';
import Assignment from '../../util/assignment';
import Constants from '../../util/constants';

export default class DisallowRole extends Command<Client>
{
	public constructor(bot: Client)
	{
		super(bot, {
			name: 'disallow',
			aliases: ['d'],
			description: 'Disallow Role',
			usage: '<prefix>disallow <Argument>\u000d	   <prefix>disallow <Argument>, <Argument>, ...\u000d	   <prefix>d <Argument>\u000d	   <prefix>d <Argument>, <Argument>, ...\u000d',
			extraHelp: 'This command will disallow a specific role to be self-assignable.\u000d\u000dArgument information below...\u000d\u000dRole Name : The name of the role to be disallowed.\u000d\u000d*If Protomolecule tells you to be more specific, type the role as if it were case-sensitive. Protomolecule will then find your specific role.',
			group: 'assignment',
			roles: ['The Rocinante'],
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
		let scrub: Boolean = false;

		// make sure a role was specified
		if (args.length === 0)
			return message.channel.sendMessage('Please specify a role to allow.');

		if (Constants.scrubRegExp.test(message.content))
			scrub = true;

		// make sure available roles isn't empty
		if (availableRoles === null)
			return message.channel.sendMessage(`No roles currently allowed.`);

		// create array from user input
		roleArgs = message.content.match(Constants.cslRegExp);
		roleArgs = roleArgs.map((el: string) => { return el.toString().replace(Constants.disallowRegExp, ''); });

		// if one role specified
		if (roleArgs.length === 1)
		{
			// search for role
			let options: any = { extract: (el: any) => { return el.name; } };
			let results: any = fuzzy.filter(roleArgs[0], availableRoles, options);

			// check if role is valid
			if (results.length === 0)
				return message.channel.sendMessage(`\`${roleArgs[0]}\` is not a valid role.`);

			// disallow role
			if (results.length === 1)
			{
				// role from result
				role = message.guild.roles.get(results[0].original.id);

				// remove the role from the allowed list
				availableRoles.splice(Assignment.getRoleToRemove(availableRoles, role.name), 1);
				guildStorage.set('Server Roles', availableRoles);

				// check if scrub option was used
				if (scrub)
					Assignment.removeRoleFromUserBase(message, role);
				else
					// display success message
					return message.channel.sendMessage(`\`${role.name}\` successfully disallowed.`);
			}

			// more than one role found
			if (results.length > 1)
			{
				// check if roleArg is specifically typed
				if (Assignment.isSpecificResult(results, roleArgs[0]))
				{
					// remove the role from the allowed list
					availableRoles.splice(Assignment.getRoleToRemove(availableRoles, Assignment.getSpecificRoleName(results, roleArgs[0])), 1);
					guildStorage.set('Server Roles', availableRoles);

					// check if scrub option was used
					if (scrub)
						Assignment.removeRoleFromUserBase(message, role);
					else
						// display success message
						return message.channel.sendMessage(`\`${role.name}\` successfully disallowed.`);
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

			roleArgs.forEach((el: string) => {
				// search for role
				let options: any = { extract: (r: any) => { return r.name; } };
				let results: any = fuzzy.filter(el, availableRoles, options);

				 // check if role is valid
				if (results.length === 0)
					invalidRoles.push(el);

				// if one role found
				if (results.length === 1)
				{
					// role from result
					role = message.guild.roles.get(results[0].original.id);

					// remove the role from the allowed list
					availableRoles.splice(Assignment.getRoleToRemove(availableRoles, role.name), 1);

					// add role to valid array
					validRoles.push(role);
				}

				// more than one role found
				if (results.length > 1)
				{
					// check if roleArg is specifically typed
					if (Assignment.isSpecificResult(results, el))
					{
						// role from roleArg
						role = Assignment.getSpecificRole(results, el);

						// remove the role from the allowed list
						availableRoles.splice(Assignment.getRoleToRemove(availableRoles, Assignment.getSpecificRoleName(results, el)), 1);

						// add role to valid array
						validRoles.push(role);
					}
					else
						// add inspecific results to invalid array
						results.forEach((r: any) => { invalidRoles.push(r.string); });
				}
			});

			// update roles
			guildStorage.set('Server Roles', availableRoles);

			// build output embed
			embed
				.setColor(0x206694)
				.setTitle(message.guild.name + ': Roles Update')
				.addField('Disllowed Roles', validRoles.join('\n') ? validRoles.join('\n') : '\u200b', true)
				.addField('Invalid Roles', invalidRoles.join('\n') ? invalidRoles.join('\n') : '\u200b', true)
				.setDescription('Invalid Roles are either already disallowed, incorrectly typed, or not a current server role.');

			// display output embed
			return message.channel.sendEmbed(embed, '', { disableEveryone: true });
		}
	}
}
