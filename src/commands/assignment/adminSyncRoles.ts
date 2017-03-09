'use strict';

import { Bot, Command } from 'yamdbf';
import { Collection, GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import util from '../../util/assignment/util';

export default class SyncRoles extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'syncRoles',
            aliases: ['sync', 'SYNC', 'Sync', 'sr', 's'],
            description: 'Synchronize the allowed roles with the current server roles.',
            usage: '<prefix>sync',
            extraHelp: 'This command will remove any non-existent server roles from the list of allowed roles.',
            group: 'assignment',
            guildOnly: true
        });
    }

    public action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        const guildStorage: any = this.bot.guildStorages.get(message.guild);
        const availableRoles: Array<any> = guildStorage.getItem('Server Roles');
        const serverRoles: Collection<string, Role> = new Collection(Array.from(message.guild.roles.entries()).sort((a: any, b: any) => b[1].position - a[1].position));
        let adminCommandRole: Role;
        let updatedRoles: any = Array();
        let currentRoles: string = String();
        let removedRoles: string = String();

        // make sure server owner has set an Admin Role
        if (!guildStorage.getItem('Admin Role'))
            return message.channel.sendMessage('Please assign an Admin Role with `.set <Role Name>`.');

        // find admin command role
        adminCommandRole = message.guild.roles.get(guildStorage.getItem('Admin Role').toString());

        // make sure user has the admin command role
        if (!message.member.roles.find('name', adminCommandRole.name))
            return message.channel.sendMessage('You do not permissions to run this command.');

        const noRoles: RichEmbed = new RichEmbed()
            .setColor(0x274E13)
            .setAuthor(message.guild.name + ': Role Synchronization', message.guild.iconURL)
            .addField('Current Allowed Roles', '\nNo roles currently allowed.')
            .setTimestamp();

        // make sure there are allowed roles
        if (availableRoles === null)
            return message.channel.sendEmbed(noRoles, '', { disableEveryone: true });

        // iterate through availableRoles, create updated list
        availableRoles.forEach((el: any) => {
            if (serverRoles.find('name', el.name))
            {
                updatedRoles.push(el);
                currentRoles += '\n' + el.name;
            }
            else
                removedRoles += '\n' + el.name;
        });

        // update availableRoles
        guildStorage.setItem('Server Roles', updatedRoles);

        // make sure there are current roles
        if (currentRoles === '')
            return message.channel.sendEmbed(noRoles, '', { disableEveryone: true });

        // check if there are roles to remove
        if (removedRoles === '')
            removedRoles = '*No roles removed*';
        
        // build the output embed
        const embed: RichEmbed = new RichEmbed()
            .setColor(0x274E13)
            .setAuthor(message.guild.name + ': Role Synchronization', message.guild.iconURL)
            .addField('Current Allowed Roles', currentRoles)
            .addField('Roles Cleaned from Allowed List', removedRoles)
            .setTimestamp();
 
        // display the list
        return message.channel.sendEmbed(embed, '', { disableEveryone: true });
    }
}
