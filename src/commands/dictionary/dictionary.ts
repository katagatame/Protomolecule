'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import Constants from '../../util/constants';
import Term from '../../util/term';

export default class DisekowtelowdaDictionary extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'dd',
            description: 'Disekowtelowda Dictionary',
            usage: '<prefix>dd',
            extraHelp: 'Use this command to interact with the Disekowtelowda Dictionary, as a whole.',
            group: 'dictionary',
            guildOnly: true
        });
    }

    public async action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        const guildStorage: any = this.bot.guildStorages.get(message.guild);
        const terms: Array<Term> = guildStorage.getItem('BeltaTerms');
        let query: string = '';

        // evaluate the query
        switch (args.join(' '))
        {
            case 'clist':
            case 'chars':
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
                    .addField('Instructions', 'Press and hold `Alt`, then press a number combination.', false)
                    .setTimestamp();
                
                // display the embed
                return message.channel.sendEmbed(embed, '', { disableEveryone: true });

            case 'sync':
                // make sure user has the admin command role
                if (!message.member.roles.find('name', 'The Rocinante'))
                    return message.channel.sendMessage('You do not permissions to run this command.');

                if (!Term.updateTerms(guildStorage))
                    return message.channel.sendMessage('Terms have been updated!');
                else
                    return message.channel.sendMessage('Terms have not been updated!  Check error logs.');
            default:
                return message.channel.sendMessage('Please specify a command.');
        }
    }
};
