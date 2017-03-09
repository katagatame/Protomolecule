'use strict';

import { Bot, Command } from 'yamdbf';
import { Collection, GuildMember, Message, Role, User } from 'discord.js';
import * as fuzzy from 'fuzzy';
import util from '../../util/assignment/util';

export default class AllowRole extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'allowRole',
            aliases: ['allow', 'ALLOW', 'Allow', 'a'],
            description: 'Allow specified role to be self-assigned.',
            usage: '<prefix>allow <Role Name>',
            group: 'assignment',
            guildOnly: true
        });
    }

    public action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        const re: RegExp = new RegExp('(?:allow\\s|a\\s)(.+)', 'i');
        const guildStorage: any = this.bot.guildStorages.get(message.guild);
        const serverRolesArray: Array<[string, Role]> = Array.from(message.guild.roles.entries());
        let availableRoles: Array<any> = guildStorage.getItem('Server Roles');
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
        if (re.test(message.content))
            roleArg = re.exec(message.content)[1];
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
            if (util.doesRoleExist(availableRoles, role))
                return message.channel.sendMessage(`\`${role.name}\` is already an allowed role.`);

            // update roles
            util.updateRoles(availableRoles, guildStorage, message, role);
        }

        // more than one role found
        if (results.length > 1)
        {
            // check if roleArg is specifically typed
            if (util.isSpecificResult(results, roleArg))
            {
                // role from roleArg
                role = util.getSpecificRole(results, roleArg);

                // check if role already is allowed
                if (util.doesRoleExist(availableRoles, role))
                    return message.channel.sendMessage(`\`${role.name}\` is already an allowed role.`);
                
                // update roles
                util.updateRoles(availableRoles, guildStorage, message, role);
            }
            else
                // be more specific
                return message.channel.sendMessage(`More than one role found: \`${results.map((el: any) => { return el.string; }).join(', ')}\`,  please be more specific.`);
        }
    }
}
