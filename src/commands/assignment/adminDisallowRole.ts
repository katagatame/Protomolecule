'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, Role, User } from 'discord.js';
import * as fuzzy from 'fuzzy';
import util from '../../util/assignment';

export default class DisallowRole extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'disallowRole',
            aliases: ['disallow', 'DISALLOW', 'Disallow', 'd'],
            description: 'Disallow specified role to be self-assigned.',
            usage: '<prefix>disallow <Role Name>',
            group: 'assignment',
            guildOnly: true
        });
    }

    public action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        const re: RegExp = new RegExp('(?:.disallow\\s|.d\\s)(.+[^\\s-s])', 'i');
        const reS: RegExp = new RegExp('(?:-s)', 'i');
        const guildStorage: any = this.bot.guildStorages.get(message.guild);
        let availableRoles: Array<any> = guildStorage.getItem('Server Roles');        
        let scrub: Boolean = false;
        let roleArg: string = String();
        let adminCommandRole: Role;
        let role: Role;

        // make sure server owner has set an Admin Role
        if (!guildStorage.getItem('Admin Role'))
            return message.channel.sendMessage('Please assign an Admin Role with `.set <Role Name>`.');

        // find admin command role
        adminCommandRole = message.guild.roles.get(guildStorage.getItem('Admin Role').toString());

        // make sure user has the admin command role
        if (!message.member.roles.find('name', adminCommandRole.name))
            return message.channel.sendMessage('You do not permissions to run this command.');

        // make sure a role was specified
        if (re.test('.' + message.content))
            roleArg = re.exec('.' + message.content)[1];
        else
            return message.channel.sendMessage('Please specify a role to disallow.');
        
        if (reS.test(message.content))
            scrub = true;
        
        // make sure available roles isn't empty
        if (availableRoles === null)
            return message.channel.sendMessage(`No roles currently allowed.`);
        
        // search for role
        let options: any = { extract: (el: any) => { return el.name } };
        let results: any = fuzzy.filter(roleArg, availableRoles, options);

        // check if role is valid
        if (results.length === 0)
            return message.channel.sendMessage(`\`${roleArg}\` is not a valid role.`);
        
        // disallow role
        if (results.length === 1)
        {
            // role from result
            role = message.guild.roles.get(results[0].original.id);
            
            // remove the role from the allowed list
            availableRoles.splice(util.getRoleToRemove(availableRoles, role.name), 1);
            guildStorage.setItem('Server Roles', availableRoles);

            // check if scrub option was used
            if (scrub)
                util.removeRoleFromUserBase(message, role);
            else
                // display success message
                return message.channel.sendMessage(`\`${role.name}\` successfully disallowed.`);
        }

        // more than one role found
        if (results.length > 1)
        {
            // check if roleArg is specifically typed
            if (util.isSpecificResult(results, roleArg))
            {
                // remove the role from the allowed list
                availableRoles.splice(util.getRoleToRemove(availableRoles, util.getSpecificRoleName(results, roleArg)), 1);
                guildStorage.setItem('Server Roles', availableRoles);

                // check if scrub option was used
                if (scrub)
                    util.removeRoleFromUserBase(message, role);
                else
                    // display success message
                    return message.channel.sendMessage(`\`${role.name}\` successfully disallowed.`);
            }
            else
                // be more specific
                return message.channel.sendMessage(`More than one role found: \`${results.map((el: any) => { return el.string; }).join(', ')}\`,  please be more specific.`);
        }            
    }
}
