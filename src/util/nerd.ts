'use strict';

import { Message, RichEmbed } from 'discord.js';
import * as moment from 'moment';
import Constants from '../util/constants';
import Term from '../util/term';

export default class Nerd
{
	public static generateRandomURL(): Array<string>
	{
		// variable declaration
		const now: Date = new Date();
		const min: number = new Date(1995, 5, 16).getTime();
		const max: number = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 18, 59, 59, 999).getTime() - (5 * 60 * 60 * 1000);
		const mMin: number = new Date(1995, 5, 17).getTime();
		const mMax: number = new Date(1995, 5, 19, 23, 59, 59, 999).getTime();

		// grab the random date between the above mins/maxs
		let rDate: number = Math.round(min + Math.random() * (max - min));
		while (rDate >= mMin && rDate <= mMax) {
			rDate = Math.round(min + Math.random() * (max - min));
		}
		const random: Date = new Date(rDate);

		// grab the individual date parts for the url
		const rD: string = (0 + random.getDate().toString()).slice(-2);
		const rM: string = (0 + (random.getMonth() + 1).toString()).slice(-2);
		const rY: string = random.getFullYear().toString();

		// make the date string pretty
		let dateString: string = moment(rY + '-' + rM + '-' + rD).format('ll');
		dateString = '  --  ' + dateString;

		// return array with url and datestring
		return ['http://apod.nasa.gov/apod/ap' + rY.slice(-2) + rM + rD + '.html', dateString];
	}

	public static flashcardMessage(message: Message, terms: Array<Term>, index: number): any
	{
		const embed: RichEmbed = new RichEmbed()
			.setColor(0x206694)
			.setAuthor('Disekowtalowda Dictionary', Constants.guildIconURL)
			.setDescription('\u000dThis belta term means **' +
				terms[index].definition
					.replace('1. ', '')
					.replace('2. ', '** *or* **')
					.replace('\\n\\n', '') +
					'**?')
			.addField('\u200b', '1⃣  ' + terms[0].term + '\n\n2⃣  ' + terms[1].term, true)
			.addField('\u200b', '3⃣  ' + terms[2].term + '\n\n4⃣  ' + terms[3].term, true)
			.setFooter('Type the number of the corresponding answer.');

		return message.channel.sendEmbed(embed, '', { disableEveryone: true })
			.then(() => {
				message.channel.awaitMessages(response => (response.content === (index + 1).toString() && response.author.id === message.author.id), {
					max: 1,
					time: 10000,
					errors: ['time']
				})
				.then((collected) => {
					message.channel.sendMessage(`Yes, *${terms[index].term}* is the correct term!`);
					return message.channel.stopTyping();
				})
				.catch(() => {
					message.channel.sendMessage(`Time limit exceeded.  The correct term was *${terms[index].term}*.`);
					return message.channel.stopTyping();
				});
			});
	}

	public static pad(n: string): string
	{
		return (parseInt(n) < 10) ? ('0' + n) : n;
	}
}
