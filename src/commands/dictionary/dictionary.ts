'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import * as fs from 'fs';
import * as fuzzy from 'fuzzy';
import * as gapi from 'googleapis';
import Google from '../../util/google';
import Term from '../../util/term';

export default class DisekowtelowdaDictionary extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'DisekowtelowdaDictionary',
            aliases: ['dd'],
            description: 'A small dictionary of Belta terms.',
            usage: '<prefix>dd',
            group: 'dictionary',
            guildOnly: true
        });
    }

    public async action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        const guildStorage: any = this.bot.guildStorages.get(message.guild);
        const terms: Array<Term> = guildStorage.getItem('BeltaTerms');
        const re: RegExp = new RegExp('(?:.dd\\s)(.+)', 'i');        
        let query: string = '';

        // make sure a role was specified
        if (re.test('.' + message.content))
            query = re.exec('.' + message.content)[1];
        else
            return message.channel.sendMessage('Please specify a command.');
        
        // evaluate the query
        switch (query)
        {
            case 'clist':
            case 'chars':
            case 'characters':
            case 'shortcuts':
            case 'slist':
                // build the embed
                const cList: Array<string> = Term.getCharacterList();
                const sList: Array<string> = Term.getShortcutList();
                const embed: RichEmbed = new RichEmbed()
                    .setColor(0x206694)
                    .setAuthor('Disekowtalowda Dictionary', message.guild.iconURL)
                    .addField('Character', '`' + cList.join('\`\n\`') + '`', true)
                    .addField('Keyboard Shortcut', '`' + sList.join('\`\n\`') + '`', true)
                    .addField('Instructions', 'To use these shortcuts do the following:\n\npress and hold `Alt`, then press a number combination.', false)
                    .setTimestamp();
                
                // display the embed
                return message.channel.sendEmbed(embed, '', { disableEveryone: true });

            case 'sync':
                // find admin command role
                let adminRole: string = guildStorage.getItem('Admin Role');

                if (adminRole === null)
                    return message.channel.sendMessage('The is no `Admin Role` set.');

                let adminCommandRole: Role = message.guild.roles.get(adminRole);

                // make sure user has the admin command role
                if (!message.member.roles.find('name', adminCommandRole.name))
                    return message.channel.sendMessage('You do not permissions to run this command.');

                if (!Term.updateTerms(guildStorage))
                    return message.channel.sendMessage('Terms have been updated!');
                else
                    return message.channel.sendMessage('Terms have not been updated!  Check error logs.');

            default:
                break;
        }
    }
};
