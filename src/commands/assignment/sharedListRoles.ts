'use strict';

import { Bot, Command } from 'yamdbf';
import { Collection, GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import Assignment from '../../util/assignment';

export default class ListRoles extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'list',
            aliases: ['LIST', 'List', 'l'],
            description: 'List Roles',
            usage: '<prefix>list',
            extraHelp: 'Use this command to display a list of roles.',
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
        let adminCommandRole: Role = message.guild.roles.find('name', 'The Rocinante');
        let leftCol: string = String();
        let rightCol: string = String();
        const noRoles: RichEmbed = new RichEmbed()
            .setColor(0x206694)
            .setTitle(message.guild.name + ': Role Synchronization')            
            .addField('Current Allowed Roles', '\nNo roles currently allowed.')
            .setTimestamp();

        if (adminCommandRole !== undefined && message.member.roles.find('name', adminCommandRole.name))
        {
            // iterate through server roles to build leftCol/rightCol
            serverRoles.forEach((el: any) => {
                // grab all roles below Admin Role, exclude @everyone and bots
                if (el.position < adminCommandRole.position && el.name !== '@everyone' && el.managed === false)
                {
                    leftCol += '\n' + el.name;
                    if (Assignment.existsInArray(availableRoles, el.name))
                        rightCol += '\n**Allowed**';
                    else
                        rightCol += '\nNot Allowed';
                }
            });

            // build the output embed
            const modEmbed: RichEmbed = new RichEmbed()
                .setColor(0x206694)
                .setAuthor(message.guild.name + ': List of Roles', message.guild.iconURL)
                .addField('Roles', leftCol, true)
                .addField('Status', rightCol, true)
                .setTimestamp();
            
            // display the list
            return message.channel.sendEmbed(modEmbed, '', { disableEveryone: true });
        }
        else
        {
            if (availableRoles === [] || availableRoles === null)
                return message.channel.sendEmbed(noRoles, '', { disableEveryone: true });

            // iterate through server roles to build leftCol
            availableRoles.forEach((el: any) => leftCol += '\n' + el.name);
            
            // build the output embed
            const userEmbed: RichEmbed = new RichEmbed()
                .setColor(0x206694)
                .setAuthor(message.guild.name + ': List of Roles', message.guild.iconURL)
                .addField('Roles', leftCol, true)
                .setTimestamp();
            
            // display the list
            return message.channel.sendEmbed(userEmbed, '', { disableEveryone: true });
        }
    }
}
