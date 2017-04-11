'use strict';

import { Client, Command, GuildStorage } from 'yamdbf';
import { Message } from 'discord.js';
import * as fuzzy from 'fuzzy';
import Constants from '../../util/constants';
import Term from '../../util/term';

export default class BelterWordSearch extends Command<Client>
{
	public constructor(bot: Client)
	{
		super(bot, {
			name: 'bt',
			description: 'Belta Word Search',
			usage: '<prefix>bt <Belta Term>',
			extraHelp: 'Use this command to look up a Belta term within the Disekowtalowda Dictionary.',
			group: 'dictionary'
		});
	}

	public async action(message: Message, args: string[]): Promise<any>
	{
		// variable declaration
		const guildStorage: GuildStorage = this.client.storage.guilds.get(message.guild.id);
		const belter: Array<Term> = await guildStorage.get('BeltaTerms');

		// error checking
		if (belter === null)
		{
			message.channel.sendMessage('Currently no terms in list, please sync the list with `.dd sync`.');
			return message.channel.stopTyping();
		}

		// check if a term was specified
		if (args.length === 0)
			return message.channel.sendMessage('Please specify a term.');

		// serach for term
		let options: any = { extract: (el: any) => { return el.term; } };
		let results: Array<any> = fuzzy.filter(args.join(' '), belter, options);

		// check if term exists
		if (results.length === 0)
			return message.channel.sendMessage(`\`${args.join(' ')}\` is not a valid term.`);

		// if single term found
		if (results.length === 1)
			return Term.sendTerm(message, results[0].original);

		// if multiple terms found
		if (results.length >= 2)
		{
			// is the query specifically typed?
			if (Term.isSpecificResult(results, args.join(' ')))
			{
				// variable declaration
				let termResults: Array<Term> = Term.getSpecificResults(results, args.join(' '));

				// if single term found
				if (termResults.length === 1)
					return Term.sendTerm(message, termResults[0]);

				// define parts of speech
				const re: RegExp = new RegExp(Constants.partsOfSpeech.join('|'), 'ig');
				let part: string = '';

				// create confirmation filter
				const filter: any = (m: Message) => {
					if (m.author.id === message.author.id && m.content.match(re))
					{
						part = m.content.toLowerCase();
						return m.content;
					}
				};

				// send confirmation message
				message.channel.sendMessage(`This term has more than one part of speech: \`${termResults.map((el: any) => { return el.partOfSpeech; }).join('\`, \`')}\`. Please specifiy which one you meant.`)
					// wait for response
					.then(() => {
						message.channel.awaitMessages(filter, {
							max: 1,
							time: 7000,
							errors: ['time'],
						}
					)
					// collect response
					.then((collected) => {
						// variable declaration
						let termResult: Term = new Term();

						// grab the term based on user input
						for (let x: number = 0; x < termResults.length; x++)
						{
							if (termResults[x].partOfSpeech.toLowerCase() === part)
								termResult = termResults[x];
						}

						// display definition
						return Term.sendTerm(message, termResult);
					})
					// user failed to input in the alotted time
					.catch(() => {
						return message.channel.sendMessage('There was no part of speech specified within the time limit.');
					});
				});
			}

			// be more specific
			else
			{
				// variable declaration
				let distinctTerms: Array<string> = new Array();

				// build distinct term list for error message
				for (let x: number = 0; x < results.length; x++)
				{
					if (distinctTerms.indexOf(results[x].original.term) === -1)
						distinctTerms.push(results[x].original.term);
				}

				// display error message
				return message.channel.sendMessage(`More than one term found: \`${distinctTerms.join('\`, \`')}\`.  Please re-run the command and be more specific.`);
			}
		}
	}
};
