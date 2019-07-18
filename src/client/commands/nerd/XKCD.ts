import { Command, Message } from '@yamdbf/core';
import { MessageEmbed } from 'discord.js';

import Nerd from '../../../lib/util/Nerd';
import Util from '../../../lib/util';

export default class XKCD extends Command {
	public constructor() {
		super({
			name: 'xkcd',
			desc: 'XKCD Comics',
			usage: '<prefix>xkcd <Argument>?',
			ratelimit: '1/3m',
			info:
				'This command will return the latest XKCD Comic, a random one from the archive, or a specific comic.\n\n' +
				'Argument information below...\n\n' +
				'r       : Random XKCD Comic\n\n' +
				'1-2000+ : Specific XKCD Comic\n\n' +
				'*Running the command without an argument returns returns the most recent XKCD comic.',
			group: 'nerd',
			guildOnly: false
		});
	}

	public async action(message: Message, args: string[]): Promise<void> {
		message.channel.startTyping();

		let isRandom: boolean | undefined;

		if (args[0]) isRandom = args[0] === 'r';
		const comicNumber: number | undefined =
			args[0] && Util.isNumerical(args[0]) ? Number(args[0]) : undefined;

		await Nerd.fetchComic(comicNumber, isRandom)
			.then((embed: MessageEmbed): void => {
				message.channel.send(embed);
			})
			.catch((): void => {
				message.channel.send(`There was an error retrieving the XKCD Comic.`);
			});

		return message.channel.stopTyping();
	}
}
