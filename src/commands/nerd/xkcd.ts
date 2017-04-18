'use strict';

import { Client, Command } from 'yamdbf';
import { Message, RichEmbed } from 'discord.js';
import Comic from '../../util/comic';
import Nerd from '../../util/nerd';
import * as moment from 'moment';
import * as request from 'request-promise';

export default class XKCD extends Command<Client>
{
	public constructor(bot: Client)
	{
		super(bot, {
			name: 'xkcd',
			description: 'XKCD Comics',
			usage: '<prefix>xkcd <Argument>?',
			extraHelp: 'This command will return the latest XKCD Comic, a random one from the archive, or a specific comic.\u000d\u000dArgument information below...\u000d\u000dr       : Random XKCD Comic\u000d1-1800+ : Specific XKCD Comic\u000d\u000d*Running the command without an argument returns the most recent XKCD comic.',
			group: 'nerd'
		});
	}

	public async action(message: Message, args: string[]): Promise<any>
	{
		// variable declaration
		const baseURL: string = 'http://xkcd.com/';
		const xkcdJSON: string = 'info.0.json';

		// show the user we're working
		message.channel.startTyping();

		// max amount of comics
		let max: any = await request({ uri: baseURL + xkcdJSON, json: true });

		// random comic
		let rComic: number = Math.floor((Math.random() * parseInt(max.num)) + 1);

		// url, checks for numbers and 'r'
		let url: string = (/\d+/.test(args[0])) ? baseURL + args[0] + '/' + xkcdJSON : ((args[0] === 'r') ? baseURL + rComic + '/' + xkcdJSON : baseURL + xkcdJSON);

		// request options
		let options: any = { uri: url, json: true };

		// make the request
		request(options)
			.then((comic: Comic) => {
				// build the panel embed
				const panelEmbed: RichEmbed = new RichEmbed()
					.setColor(0x206694)
					.setAuthor(comic.title)
					.setImage(comic.img);

				// build the alt embed
				const altEmbed: RichEmbed = new RichEmbed()
					.setColor(0x206694)
					.setAuthor(moment(`${comic.year}-${Nerd.pad(comic.month)}-${Nerd.pad(comic.day)}`).format('LL') + ' #' + comic.num)
					.setDescription(comic.alt);

				// display the embesd
				message.channel.sendEmbed(panelEmbed, '', { disableEveryone: true });
				message.channel.sendEmbed(altEmbed, '', { disableEveryone: true });

				// stop working
				return message.channel.stopTyping();
			})
			.catch((err: any) => {
				// log the error
				console.log(err);

				// stop working
				return message.channel.stopTyping();
			});
	}
}
