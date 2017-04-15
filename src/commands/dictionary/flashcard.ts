'use strict';

import { Client, Command, GuildStorage, RateLimit } from 'yamdbf';
import { Message, } from 'discord.js';
import Nerd from '../../util/nerd';
import Term from '../../util/term';

export default class BelterWordSearch extends Command<Client>
{
	public constructor(bot: Client)
	{
		super(bot, {
			name: 'fc',
			description: 'Belta Flashcard',
			usage: '<prefix>fc',
			extraHelp: 'This command generates a flashcard of a random Belta term\'s definition and provide four(4) reactions for you to respond to.\u000d\u000d*Each reaction is associated with an answer to the flashcard.\u000d\u000d*Click on the appropriate reaction to answer.\u000d\u000d*You will have ten(10) seconds to respond.',
			group: 'dictionary',
			guildOnly: true,
			ratelimit: '1/10s'
		});

		const rateLimit: RateLimit = new RateLimit([1, 10e3]);
		this.use((message, args) => { if (rateLimit.call()) return [message, args]; });
	}

	public async action(message: Message, args: string[]): Promise<any>
	{
		// variable declaration
		const guildStorage: GuildStorage = this.client.storage.guilds.get(message.guild.id);
		const belter: Array<Term> = await guildStorage.get('BeltaTerms');
		let pool: Array<number> = new Array(belter.length);
		let random: number = Math.floor(Math.random() * belter.length);
		let term: Term = belter[random];
		let terms: Array<Term> = new Array();
		let index: number = 0;
		let userReaction: boolean = false;

		message.channel.startTyping();

		// if there is no definition, grab another
		if (term.definition === '--')
			term = belter[Math.floor(Math.random() * belter.length)];

		// build array of numbers to choose from
		for (let x: number = 0; x < pool.length; x++)
		{
			pool[x] = (x + 1);
		}

		// remove the correct term from pool
		pool.splice(random, 1);

		// first random term
		let a: number = Math.floor(Math.random() * pool.length);
		pool.splice(a, 1);

		// second random term
		let b: number = pool[Math.floor(Math.random() * pool.length)];
		pool.splice(b, 1);

		// third random term
		let c: number = pool[Math.floor(Math.random() * pool.length)];

		// build term array for flashcard
		terms.push(term);
		terms.push(belter[a]);
		terms.push(belter[b]);
		terms.push(belter[c]);

		// randomize the terms
		let currentIndex: number = terms.length;
		let temporaryValue: Term = new Term();
		let randomIndex: number = 0;

		while (0 !== currentIndex)
		{
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			temporaryValue = terms[currentIndex];
			terms[currentIndex] = terms[randomIndex];
			terms[randomIndex] = temporaryValue;
		}

		// find the corect term
		index = terms.findIndex((t: Term) => { return t.term === term.term; });

		// send the flashcard
		Nerd.flashcardMessage(message, terms, index);
		return message.channel.stopTyping();
	}
}
