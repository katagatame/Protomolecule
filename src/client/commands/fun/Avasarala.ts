import { Command } from '@yamdbf/core';
import { Message, MessageEmbed } from 'discord.js';

import Quote from '../../../lib/interfaces/fun/Quote';

import constants from '../../../lib/Constants';
import quotes = require('../../../data/aQuotes.json');
import images = require('../../../data/aImages.json');

export default class Avasarala extends Command {
	public constructor() {
		super({
			name: 'ca',
			desc: 'A Random Quote from Chrisjen Avasarala',
			usage: '<prefix>ca',
			info: 'A command that returns a random quote from Chrisjen Avasarala.',
			group: 'nerd'
		});
	}

	public async action(message: Message): Promise<Message | Message[]> {
		const quote: Quote = quotes[Math.floor(Math.random() * quotes.length)];
		const image: string = images[Math.floor(Math.random() * images.length)];

		const embed: MessageEmbed = new MessageEmbed()
			.setColor(constants.embedColorBase)
			.setAuthor('Chrisjen Avasarala says...')
			.setThumbnail(image)
			.addField('\u200b', '"' + quote.content + '"', false)
			.setFooter(quote.source);

		return message.channel.send({ embed });
	}
}
