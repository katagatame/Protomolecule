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
            name: 'ca',
            description: 'A Random Quote from Chrisjen Avasarala',
            usage: '<prefix>ca',
            extraHelp: 'A command that returns A random quote from Chrisjen Avasarala',
            group: 'nerd',
            guildOnly: true
        });
    }

    public async action(message: Message, args: string[]): Promise<any>
    {
        const quote: string = Constants.avasaralaQuotes[Math.floor(Math.random() * Constants.avasaralaQuotes.length)];
        const image: string = Constants.avasaralaImage[Math.floor(Math.random() * Constants.avasaralaImage.length)];
        const embed: RichEmbed = new RichEmbed()
            .setColor(0x206694)
            .setAuthor('Chrisjen Avasarala Says...', message.guild.iconURL)
            .setThumbnail(image)
            .addField('\u200b', '"' + quote + '"', false)
            .setTimestamp();            
        
        return message.channel.sendEmbed(embed, '', { disableEveryone: true });
    }
};
