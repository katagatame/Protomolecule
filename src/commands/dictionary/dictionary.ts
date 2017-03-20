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
                const cList: Array<string> = Term.getCharacterList();
                const sList: Array<string> = Term.getShortcutList();
                const embed: RichEmbed = new RichEmbed()
                    .setColor(0x274E13)
                    .setAuthor('Disekowtalowda Dictionary', message.guild.iconURL)
                    .addField('Character', '`' + cList.join('\`\n\`') + '`', true)
                    .addField('Keyboard Shortcut', '`' + sList.join('\`\n\`') + '`', true)
                    .addField('Instructions', 'To use these shortcuts do the following:\n\npress and hold `Alt`, then press a number combination.', false)
                    .setTimestamp();
                
                return message.channel.sendEmbed(embed, '', { disableEveryone: true });
            default:
                break;
        }
    }
};
