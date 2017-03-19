'use strict';
import { Bot, Command } from 'yamdbf';
import { Message, User, RichEmbed } from 'discord.js';
import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import util from '../../util/nerd';

export default class APoD extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'APoD',
            aliases: ['apod', 'APOD'],
            description: 'NASA\'s Astronomy Picture of the Day',
            usage: '<prefix>apod, <prefix>apod r',
            extraHelp: 'A command that returns the NASA Astronomy Picture of the Day, along with explanation.',
            group: 'nerd',
            guildOnly: true,
            ownerOnly: false
        });
    }

    public async action(message: Message, args: string[]): Promise<any>
    {
        let uri: string = 'https://apod.nasa.gov/apod/astropix.html';
        const now: Date = new Date();
        let dateString: string = ' -- ' + moment(now).format('ll');        

        // get a random day from the archives
        if (args[0] === 'r')
        {
            let randomDetails: any = util.generateRandomURL();
            uri = randomDetails[0];
            dateString = randomDetails[1];
        }

        // prepare for the request
        const options: any = {
            uri: uri,
            transform: function (el: any) { return cheerio.load(el); }
        };

        message.channel.startTyping();
        // make the request
        request(options)
            .then(function ($: any)
            {
                // grab the important stuff
                const img: string = $('img').attr('src');
                const iFrame: string = $('iframe').attr('src');
                let title: string = $('center + center > b:first-child').text().trim();
                let content: string = `http://apod.nasa.gov/apod/${img}`;
                let desc: string = $('center + center + p').text().trim()
                    .replace(/(\s)+/g, ' ')
                    .replace(/(\r\n|\n|\r)/gm, '')
                    .replace(/(Explanation:)/, '');
                let noImg: boolean = false;
                let noVideo: boolean = true;
                let imgEmbed: RichEmbed = new RichEmbed();

                // check for video content
                if (img === undefined)
                {
                    noImg = true;
                    if (iFrame !== undefined)
                    {
                        noVideo = false;
                        if (/https\:\/\/www\.youtube\.com\/embed\/([\w-]{11})/i.test(iFrame))
                        {
                            const id: string = iFrame.match(/https\:\/\/www\.youtube\.com\/embed\/([\w-]{11})/i)[1];
                            content = `https://www.youtube.com/embed/${id}`;
                        }
                    }
                }
                
                // set the imgEmbed title
                title = (title === '') ? 'NASA Astronomy Picture of The Day' : title;
                imgEmbed.setTitle(title);

                // image/video embed                
                if (noImg && noVideo)
                    imgEmbed.setDescription('*There is no embedable content for this date.*');
                
                if (noImg && !noVideo)
                    imgEmbed.setDescription('*There is video content for this date.*\n' + content);
                
                if (!noImg && noVideo)
                    imgEmbed.setImage(content);

                // explanation embed
                desc = (desc === '') ? '*There is no explanation for this content.*' : desc;
                let embed: RichEmbed = new RichEmbed()
                    .setDescription(desc)
                    .setTimestamp();
                
                if (args[0] === 'r')
                    embed.setTitle('Explanation' + dateString);
                else
                    embed.setTitle('Explanation');

                message.channel.sendMessage('', { embed: imgEmbed });
                message.channel.sendMessage('', { embed: embed });
                return message.channel.stopTyping();
            })
            .catch(function (err: any)
            {
                message.channel.sendMessage('There was an error retrieving the title and/or the description for this content.');
                return message.channel.stopTyping();
            });
        return;
    }
};
