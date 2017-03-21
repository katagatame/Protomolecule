'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import * as fuzzy from 'fuzzy';
import Assignment from '../../util/assignment';
import Constants from '../../util/constants';

export default class GetRole extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'gr',
            aliases: ['GR', 'gR', 'Gr'],
            description: 'Get Role',
            usage: '<prefix>gr <Role Name>',
            extraHelp: 'Use this command to obtain a specific role.',
            group: 'assignment',
            guildOnly: true
        });
    }

    public action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        const guildStorage: any = this.bot.guildStorages.get(message.guild);
        let availableRoles: Array<any> = guildStorage.getItem('Server Roles');
        let roleArgs: Array<any> = new Array();;
        let role: Role;

        // make sure there are allowed roles
        if (availableRoles === null)
            return message.channel.sendMessage('There are currently no self-assignable roles.');

        // make sure a role was specified
        if (args.length === 0)
            return message.channel.sendMessage('Please specify a role to assign.');
        
        // create array from user input
        roleArgs = args.map((el: any) => { return el.replace(',', ''); });

        // if one role specified
        if (roleArgs.length === 1)
        {
            // if role specified was wildcard
            if (roleArgs[0] === '*.')
            {
                availableRoles.forEach((el: any) => { message.member.addRole(el.id); });
                return message.channel.sendMessage(`\`${availableRoles.map((el: any) => {return el.name}).join('`, `')}\` successfully assigned.`);
            }

            // search for role
            let options: any = { extract: (el: any) => { return el.name } };
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
                    return message.channel.sendMessage(`More than one role found: \`${results.map((el: any) => {return el.string}).join(', ')}\`,  please be more specific.`);
            }
        }

        // if more than one role specified
        if (roleArgs.length > 1)
        {
            // variable declaration
            let invalidRoles: string = '';
            let validRoles: string = '';
            const embed: RichEmbed = new RichEmbed();

            roleArgs.forEach((el: any) => {
                // search for role
                let options: any = { extract: (el: any) => { return el.name } };
                let results: any = fuzzy.filter(el, availableRoles, options);

                // check if role is valid
                if (results.length === 0)
                    invalidRoles += el + '\n';
                
                // assign role
                if (results.length === 1)
                {
                    // try to find user
                    message.guild.fetchMember(message.author.id).then((user: GuildMember) => {
                        user.addRole(results[0].original.id);
                    }).catch((err: any) => {
                        return message.channel.sendMessage(`User could not be found.`);
                    });
                    validRoles += results[0].original.name + '\n';
                }

                // more than one role found
                if (results.length > 1)
                {
                    // check if roleArg is specifically typed
                    if (Assignment.isSpecificResult(results, el))
                    {
                        // grab the role to be assigned
                        role = message.guild.roles.find('name', Assignment.getSpecificRoleName(results, el));

                        // try to find user
                        message.guild.fetchMember(message.author.id).then((user: GuildMember) => {
                            user.addRole(role);
                        }).catch((err: any) => {
                            return message.channel.sendMessage(`User could not be found.`);
                        });
                        validRoles += role.name + '\n';
                    }
                    else
                        // be more specific
                        return message.channel.sendMessage(`More than one role found: \`${results.map((el: any) => {return el.string}).join(', ')}\`,  please be more specific.`);
                }
            });

            // error check valid/invalid roles
            if (validRoles === '')
                validRoles = '\u200b';
            if (invalidRoles === '')
                invalidRoles = '\u200b';

            // build output embed
            embed
                .setColor(0x206694)
                .setTitle(message.guild.name + ': Roles Update')            
                .addField('Valid Roles Assigned', validRoles, true)
                .addField('Invalid Roles', invalidRoles, true)
                .setDescription('Valid Roles have been assigned, Invalid Roles could not be assigned.')
                .setTimestamp();
            
            // display output embed
            return message.channel.sendEmbed(embed, '', { disableEveryone: true });
        }
    }
}
