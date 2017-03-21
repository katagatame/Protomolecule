'use strict';

import { Bot, Command } from 'yamdbf';
import { Collection, GuildMember, Message, Role, User } from 'discord.js';
import * as fuzzy from 'fuzzy';
import Assignment from '../../util/assignment';
import Constants from '../../util/constants';

export default class AllowRole extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'allow',
            aliases: ['a'],
            description: 'Allow Role',
            usage: '<prefix>allow <Role Name>',
            extraHelp: 'Use this command to allow roles to be self-assignable.',
            group: 'assignment',
            roles: ['The Rocinante'],
            guildOnly: true
        });
    }

    public action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        const guildStorage: any = this.bot.guildStorages.get(message.guild);
        const serverRolesArray: Array<[string, Role]> = Array.from(message.guild.roles.entries());
        let availableRoles: Array<any> = guildStorage.getItem('Server Roles');
        let adminCommandRole: Role = message.guild.roles.find('name', 'The Rocinante');
        let roleArg: string = '';
        let role: Role;

        // make sure a role was specified
        if (Constants.allowRegExp.test(message.content))
            roleArg = Constants.allowRegExp.exec(message.content)[1];
        else
            return message.channel.sendMessage('Please specify a role to allow.');
        
        // map roles
        let roleMap: any = serverRolesArray.filter((el: any) => {
            if (el[1].position < adminCommandRole.position && el[1].name !== '@everyone' && el[1].managed === false)
                return el[1];
        });

        // search for role
        let options: any = { extract: (el: any) => { return el[1].name; } };
        let results: Array<any> = fuzzy.filter(roleArg, roleMap, options);

        // check if role is valid
        if (results.length === 0)
            return message.channel.sendMessage(`\`${roleArg}\` is not a valid role.`);
        
        // allow role
        if (results.length === 1)
        {
            // role from result
            role = results[0].original[1];

            // check if role already is allowed
            if (Assignment.doesRoleExist(availableRoles, role))
                return message.channel.sendMessage(`\`${role.name}\` is already an allowed role.`);

            // update roles
            Assignment.updateRoles(availableRoles, guildStorage, message, role);
        }

        // more than one role found
        if (results.length > 1)
        {
            // check if roleArg is specifically typed
            if (Assignment.isSpecificResult(results, roleArg))
            {
                // role from roleArg
                role = Assignment.getSpecificRole(results, roleArg);

                // check if role already is allowed
                if (Assignment.doesRoleExist(availableRoles, role))
                    return message.channel.sendMessage(`\`${role.name}\` is already an allowed role.`);
                
                // update roles
                Assignment.updateRoles(availableRoles, guildStorage, message, role);
            }
            else
                // be more specific
                return message.channel.sendMessage(`More than one role found: \`${results.map((el: any) => { return el.string; }).join(', ')}\`,  please be more specific.`);
        }
    }
}
