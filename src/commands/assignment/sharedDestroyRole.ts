'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, Role, User } from 'discord.js';
import * as fuzzy from 'fuzzy';
import Assignment from '../../util/assignment';

export default class DestroyRole extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'dr',
            aliases: ['DR', 'dR', 'Dr'],
            description: 'Destroy Role',
            usage: '<prefix>dr <Role Name>',
            extraHelp: 'Use this command to remove a specific role.',
            group: 'assignment',
            guildOnly: true
        });
    }

    public action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        const guildStorage: any = this.bot.guildStorages.get(message.guild);
        let availableRoles: Array<any> = guildStorage.getItem('Server Roles');
        const re: RegExp = new RegExp('(?:.dr\\s)(.+)', 'i');
        let roleArg: string;
        let role: Role;

        // make sure a role was specified
        if (re.test('.' + message.content))
            roleArg = re.exec('.' + message.content)[1];
        else
            return message.channel.sendMessage('Please specify a role to remove.');

        // make sure there are allowed roles
        if (availableRoles === null)
            return message.channel.sendMessage('There are currently no self-assignable roles.');
        
        // search for role
        let options: any = { extract: (el: any) => { return el.name } };
        let results: any = fuzzy.filter(roleArg, availableRoles, options);

        // check if role is valid
        if (results.length === 0)
            return message.channel.sendMessage(`\`${roleArg}\` is not a valid role.`);
        
        // remove role
        if (results.length === 1)
        {
            // try to find user
            message.guild.fetchMember(message.author.id).then((user: GuildMember) => {
                user.removeRole(results[0].original.id);
                return message.channel.sendMessage(`\`${results[0].original.name}\` successfully removed.`);
            }).catch((err: any) => {
                return message.channel.sendMessage(`User could not be found.`);
            });            
        }

        // more than one role found
        if (results.length > 1)
        {
            // check if roleArg is specifically typed
            if (Assignment.isSpecificResult(results, roleArg))
            {
                // grab the role to remove
                role = message.guild.roles.find('name', Assignment.getSpecificRoleName(results, roleArg));
                
                // try to find user
                message.guild.fetchMember(message.author.id).then((user: GuildMember) => {
                    user.removeRole(role);
                    return message.channel.sendMessage(`\`${role.name}\` successfully removed.`);
                }).catch((err: any) => {
                    return message.channel.sendMessage(`User could not be found.`);
                });
            }
            else
                // be more specific
                return message.channel.sendMessage(`More than one role found: \`${results.map((elem: any) => {return elem.string}).join(', ')}\`,  please be more specific.`);
        }
    }
}
