'use strict';
import { Bot, Command } from 'yamdbf';
import { Message, RichEmbed } from 'discord.js';
import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import Nerd from '../../util/nerd';

export default class APoD extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'apod',
            description: 'NASA\'s Astronomy Picture of the Day',
            usage: '<prefix>apod <Argument>?',
            extraHelp: 'A command that returns the NASA Astronomy Picture of the Day, along with explanation.',
            group: 'nerd',
            guildOnly: true
        });
    }

    public async action(message: Message, args: string[]): Promise<any>
    {
        const now: Date = new Date();
        let uri: string = 'https://apod.nasa.gov/apod/astropix.html';
        let dateString: string = ' -- ' + moment(now).format('ll');

        // get a random day from the archives
        if (args[0] === 'r')
        {
            const randomDetails: Array<string> = Nerd.generateRandomURL();
            uri = randomDetails[0];
            dateString = randomDetails[1];
        }

        // prepare for the request
        const options: any = {
            uri: uri,
            transform: function (el: any) { return cheerio.load(el); }
        };

        // let the user know we're working
        message.channel.startTyping();

        // make the request
        request(options)
            .then(function ($: any)
            {
                // variable declaration
                let noImg: boolean = false;
                let noVideo: boolean = true;
                let mediaEmbed: RichEmbed = new RichEmbed()
                    .setColor(0x206694);
                
                // grab the important stuff
                const img: string = $('img').attr('src');
                const iFrame: string = $('iframe').attr('src');
                let title: string = $('center + center > b:first-child').text().trim();
                let content: string = `http://apod.nasa.gov/apod/${img}`;
                let desc: string = $('center + center + p').text().trim()
                    .replace(/(\s)+/g, ' ')
                    .replace(/(\r\n|\n|\r)/gm, '')
                    .replace(/(Explanation:)/, '');

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
                mediaEmbed.setAuthor(title);

                // no image and no video
                if (noImg && noVideo)
                    mediaEmbed.setDescription('*There is no embedable content for this date.*');

                // no image and video
                if (noImg && !noVideo)
                    mediaEmbed.setDescription('*There is video content for this date.*\n' + content);

                // image and no video
                if (!noImg && noVideo)
                    mediaEmbed.setImage(content);

                // explanation embed
                desc = (desc === '') ? '*There is no explanation for this content.*' : desc;
                let embed: RichEmbed = new RichEmbed()
                    .setColor(0x206694)
                    .setDescription(desc);

                (args[0] === 'r') ? embed.setAuthor('Explanation' + dateString) : embed.setAuthor('Explanation');

                // output the two embeds
                message.channel.sendMessage('', { embed: mediaEmbed });
                message.channel.sendMessage('', { embed: embed });

                // we're done working
                return message.channel.stopTyping();
            })
            .catch(function (err: any)
            {
                // output error message
                message.channel.sendMessage('There was an error retrieving the title and/or the description for this content.');

                // we're done working
                return message.channel.stopTyping();
            });
    }
};
