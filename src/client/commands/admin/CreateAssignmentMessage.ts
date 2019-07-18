import { Command } from '@yamdbf/core';
import { Message, MessageEmbed } from 'discord.js';

import Admin from '../../../lib/util/Admin';
import constants from '../../../lib/Constants';

export default class CreateAssignmentMessage extends Command {
	public constructor() {
		super({
			name: 'create',
			desc: 'Create a specific reaction message.',
			usage: '<prefix>create <Argument>?',
			info: '',
			group: 'admin',
			guildOnly: false,
			roles: ['The Rocinante']
		});
	}

	public async action(
		message: Message,
		args: string[]
	): Promise<Message | Message[] | void> {
		let type: string | null = args[0];

		if (type) {
			return message.channel.send(
				'Please specify a type of message to create.'
			);
		}

		let reactions: string[] = constants.bookEmoji;

		switch (type) {
			case 's':
			case 'show':
			case 'season':
			case 'seasons':
				reactions = constants.showEmoji;
				break;
			default:
				break;
		}

		let embed: MessageEmbed = await Admin.createReactionMessage(type);

		return message.channel.send({ embed }).then(
			async (message: Message): Promise<void> => {
				reactions.forEach(
					async (emoji: string): Promise<void> => {
						await message.react(emoji);
					}
				);
			}
		);
	}
}
