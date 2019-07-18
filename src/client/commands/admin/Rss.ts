import { Command, GuildStorage } from '@yamdbf/core';
import { Message, MessageEmbed } from 'discord.js';
import Rss from '../../../lib/util/Rss';
import Result from '../../../lib/interfaces/Result';
import constants from '../../../lib/Constants';

export default class CreateAssignmentMessage extends Command {
	public constructor() {
		super({
			name: 'rss',
			desc: 'Manage the servers RSS feeds.',
			usage: '<prefix>rss <Argument>?',
			info: '',
			group: 'admin',
			guildOnly: false,
			roles: ['The Rocinante']
		});
	}

	public async action(
		message: Message,
		args: string[]
	): Promise<Message | Message[]> {
		const storage: GuildStorage | undefined = this.client.storage.guilds.get(
			message.guild!.id
		);

		let result: Result;

		switch (args[0]) {
			case 'a':
			case 'add':
				if (!args[1])
					return message.channel.send(`Please specify a Feed to add.`);
				result = await Rss.addFeed(storage, args[1]);

				if (result.success) return message.channel.send(result.message);
				else return message.channel.send(result.message);

			case 's':
			case 'show':
				result = await Rss.getCurrentFeeds(storage);

				if (!result.success) return message.channel.send(result.message);
				else {
					const embed: MessageEmbed = new MessageEmbed()
						.setColor(constants.embedColorBase)
						.setAuthor(message.guild!.name + ': RSS Feeds')
						.setDescription(result.message);

					return message.channel.send({ embed });
				}

			default:
				return message.channel.send(`Please specify an action.`);
		}
	}
}
