'use strict';

import { Bot, Command } from 'yamdbf';
import { Collection, GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import * as fuzzy from 'fuzzy';
import util from '../../util/assignment';

export default class SetAdminRole extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'setAdminRole',
            aliases: ['set'],
            description: 'A command to set the Admin Role.',
            usage: '<prefix>set <Role Name>',
            group: 'assignment',
            guildOnly: true
        });
    }

    public action(message: Message, args: string[]): Promise<any>
    {
        // make sure user is server owner
        if (message.author.id !== message.guild.ownerID)
            return message.channel.sendMessage('Only the server owner can run this command.');
        
        // variable declaration
        const re: RegExp = new RegExp('(?:.set\\s)(.+)', 'i');
        const guildStorage: any = this.bot.guildStorages.get(message.guild);        
        let roleArg: string = String();
        let adminRole: Role;

        // grab roleArg from original message
        if (re.test('.' + message.content))
            roleArg = re.exec('.' + message.content)[1];
        
        // make sure the user specified a role
        if (roleArg)
        {
            // search for role
            let options: any = { extract: function(el: any) { return el[1].name; } };
            let results: Array<any> = fuzzy.filter(roleArg, Array.from(message.guild.roles.entries()), options);

            // check if role is valid
            if (results.length === 0)
                return message.channel.sendMessage(`\`${roleArg}\` is not a valid role.`);
            
            // allow role
            if (results.length === 1)
            {
                // role from result
                adminRole = results[0].original[1];
                guildStorage.setItem('Admin Role', adminRole.id);
                return message.channel.sendMessage(`Admin Role successfully set to: \`${adminRole.name}\``);
            }

            // more than one role found
            if (results.length > 1)
            {
                // check if roleArg is specifically typed
                if (util.isSpecificResult(results, roleArg))
                {
                    guildStorage.setItem('Admin Role', util.getSpecificRole(results, roleArg).id);
                    return message.channel.sendMessage(`Admin Role successfully set to: \`${adminRole.name}\``);
                }
                else
                    return message.channel.sendMessage(`More than one role found: \`${results.map((el: any) => { return el.string; }).join(', ')}\`,  please be more specific.`);
            }
        }
        else
        {
            // check guildStorage for Admin Role
            if (guildStorage.getItem('Admin Role'))
            {
                adminRole = message.guild.roles.get(guildStorage.getItem('Admin Role').toString());
                return message.channel.sendMessage(`Admin Role currently set to: \`${adminRole.name}\``);
            }
            else
                return message.channel.sendMessage('*No admin role configured.*');
        }
    }
}
