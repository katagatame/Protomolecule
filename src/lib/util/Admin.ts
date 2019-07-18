import { MessageEmbed } from 'discord.js';
import constants from '../Constants';

/**
 * @module Admin
 * @description Utility class containing static methods.
 */
export default class Admin {
	public static createReactionMessage(type: string): MessageEmbed {
		let title = 'The Expanse -- Book Exposure';
		let desc =
			'Please click on which books you would like to see discussion channels for.\n\n' +
			'They are not cumulative, select all that apply to your current content exposure.';

		switch (type) {
			case 's':
			case 'show':
			case 'season':
			case 'seasons':
				title = 'The Expanse -- Show Exposure';
				desc =
					'Please click on which seasons of the show you would like to see discussion channels for.\n\n' +
					'They are not cumulative, select all that apply to your current content exposure.';
				break;
			default:
				break;
		}

		return new MessageEmbed()
			.setColor(constants.embedColorBase)
			.setAuthor(title)
			.setDescription(desc);
	}
}
