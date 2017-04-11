'use strict';

import { Client, Command, GuildStorage } from 'yamdbf';
import { Message, RichEmbed } from 'discord.js';
import Constants from '../../util/constants';
import Term from '../../util/term';

export default class DisekowtelowdaDictionary extends Command<Client>
{
	public constructor(bot: Client)
	{
		super(bot, {
			name: 'dd',
			description: 'Disekowtalowda Dictionary',
			usage: '<prefix>dd <Argument> <Flag>?',
			extraHelp: 'This command interacts with the Dictionary as a whole.\u000d\u000dArgument information below...\u000d\u000dchars	: Return a list of characters used in Belta.\u000dwl <a-z> : Return the list of <a-z> words.\u000dsync	 : Syncs Belta terms from the Google Sheet.\u000d\u000d*sync is only available to The Rocinante.',
			group: 'dictionary'
		});
	}

	public async action(message: Message, args: string[]): Promise<any>
	{
		// variable declaration
		const guildStorage: GuildStorage = this.client.storage.guilds.get(message.guild.id);
		const terms: Array<Term> = await guildStorage.get('BeltaTerms');

		// evaluate the query
		switch (args[0])
		{
			case 'chars':
				// build the embed
				const cList: RichEmbed = new RichEmbed()
					.setColor(0x206694)
					.setAuthor('Disekowtalowda Dictionary', Constants.guildIconURL)
					.setTitle('Keyboard Shortcuts')
					.setDescription(Term.getCharacterListString())
					.addField('Instructions', 'Press and hold `Alt`, then press a number combination to produce one of the characters above.\n\n*Windows platform*', false);

				// display the embed
				return message.channel.sendEmbed(cList, '', { disableEveryone: true });

			case 'sync':
				// make sure user has the admin command role
				if (!message.member.roles.find('name', 'The Rocinante'))
					return message.channel.sendMessage('You do not permissions to run this command.');

				if (!Term.updateTerms(guildStorage))
					return message.channel.sendMessage('Terms have been updated!');
				else
					return message.channel.sendMessage('Terms have not been updated!  Check error logs.');

			case 'wl':
				if (args[1] !== undefined)
				{
					const list: Array<string> = terms
						.filter((el: Term) => { if (args[1].charAt(0).toLowerCase() ===  el.term.charAt(0).toLowerCase()) return el; })
						.map((el: Term) => { return el.term; });

					const wList: RichEmbed = new RichEmbed()
						.setColor(0x206694)
						.setAuthor('Disekowtalowda Dictionary', Constants.guildIconURL);

					if (list.length <= 10)
					{
						wList.addField(args[1].charAt(0).toUpperCase() + ' Terms', list, true);
						return message.channel.sendEmbed(wList, '', { disableEveryone: true });
					}

					if (list.length > 10 && list.length <= 20)
					{
						wList.addField(args[1].charAt(0).toUpperCase() + ' Terms', list.splice(0, 10), true);
						wList.addField('\u200b', list, true);
						return message.channel.sendEmbed(wList, '', { disableEveryone: true });
					}

					if (list.length > 20 && list.length <= 30)
					{
						wList.addField(args[1].charAt(0).toUpperCase() + ' Terms', list.splice(0, 10), true);
						wList.addField('\u200b', list.splice(0, 10), true);
						wList.addField('\u200b', list, true);
						return message.channel.sendEmbed(wList, '', { disableEveryone: true });
					}

					break;
				}
				else
					return message.channel.sendMessage('Please specify a letter to search on.');

			default:
				return message.channel.sendMessage('Please specify a valid argument.');
		}
	}
};
