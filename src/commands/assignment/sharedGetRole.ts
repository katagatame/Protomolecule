'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, Role, User } from 'discord.js';
import * as fuzzy from 'fuzzy';
import util from '../../util/assignment/util';

export default class GetRole extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'getRole',
            aliases: ['gr', 'GR', 'gR', 'Gr'],
            description: 'Get one of the specified self-assignable roles.',
            usage: '<prefix>gr <Role Name>',
            group: 'assignment',
            guildOnly: true
        });
    }

    public action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        const guildStorage: any = this.bot.guildStorages.get(message.guild);
        let availableRoles: Array<any> = guildStorage.getItem('Server Roles');
        const re: RegExp = new RegExp('(?:gr\\s)(.+)', 'i');
        let roleArg: string;
        let role: Role;

        // make sure a role was specified
        if (re.test(message.content))
            roleArg = re.exec(message.content)[1];
        else
            return message.channel.sendMessage('Please specify a role to self-assign.');

        // make sure there are allowed roles
        if (availableRoles === null)
            return message.channel.sendMessage('There are currently no self-assignable roles.');
        
        // grab all available roles
        if (roleArg.toLowerCase() === 'all')
        {
            let user: GuildMember = message.member;
            availableRoles.forEach((el: any) => {
                user.addRole(el.id);
            });

            return message.channel.sendMessage(`\`${availableRoles.map((el: any) => {return el.name}).join('`, `')}\` successfully assigned.`);
        }
        
        // search for role
        let options: any = { extract: (el: any) => { return el.name } };
        let results: any = fuzzy.filter(roleArg, availableRoles, options);

        // check if role is valid
        if (results.length === 0)
            return message.channel.sendMessage(`\`${roleArg}\` is not a valid role.`);
        
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
            if (util.isSpecificResult(results, roleArg))
            {
                // grab the role to be assigned
                role = message.guild.roles.find('name', util.getSpecificRoleName(results, roleArg));

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
                return message.channel.sendMessage(`More than one role found: \`${results.map((el: any) => {return el.string}).join(', ')}\`,  please be more specific.`);
        }
    }
}
