'use strict';
import { Bot, Command } from 'yamdbf';
import { Message, User, RichEmbed } from 'discord.js';
import Constants from '../../util/constants';
import Nerd from '../../util/nerd';

export default class APoD extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'Avasarala',
            aliases: ['ca'],
            description: 'A Random Quote from Chrisjen Avasarala',
            usage: '<prefix>ca',
            extraHelp: 'A command that returns A random quote from Chrisjen Avasarala',
            group: 'nerd',
            guildOnly: true,
            ownerOnly: false
        });
    }

    public async action(message: Message, args: string[]): Promise<any>
    {
        const quote: string = Constants.avasaralaQuotes[Math.floor(Math.random() * Constants.avasaralaQuotes.length)];
        const embed: RichEmbed = new RichEmbed()
            .setColor(0x206694)
            .setAuthor('Chrisjen Avasarala Says...')
            .setThumbnail(Constants.avasaralaImage)
            .addField('\u200b', '"' + quote + '"', false)
            .setTimestamp();            
        
        return message.channel.sendEmbed(embed, '', { disableEveryone: true });
    }
};
