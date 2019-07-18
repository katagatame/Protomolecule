import { GuildStorage } from '@yamdbf/core';
import Result from '../interfaces/Result';
import Util from '../../lib/util';
import constants from '../Constants';

/**
 * @module Rss
 * @description Utility class containing static methods for RSS management.
 */
export default class Rss {
	/**
	 * @static
	 * @async
	 * @method addFeed
	 * @description Method to add an RSS feed.
	 * @returns {Promise<boolean>} True/False based on how succesful the bot was in adding the feed.
	 */
	public static async addFeed(
		storage: GuildStorage | undefined,
		feed: string
	): Promise<Result> {
		if (!storage) return { success: false, message: 'No GuildStorage found.' };
		if (!feed.match(constants.reValidateUrl))
			return { success: false, message: 'Invalid format for RSS feed.' };

		let feeds: string[] = await storage.get('RSS_FEEDS');

		if (!feeds) await storage.set('RSS_FEEDS', [feed]);
		else {
			if (Util.exists(feeds, feed))
				return { success: false, message: `\`${feed}\` already exists.` };

			feeds.push(feed);
			await storage.set('RSS_FEEDS', feeds);
		}

		return { success: true, message: `Successfully added \`${feed}\`` };
	}

	public static async getCurrentFeeds(
		storage: GuildStorage | undefined
	): Promise<Result> {
		if (!storage) return { success: false, message: 'No GuildStorage found.' };

		let feeds: string[] = await storage.get('RSS_FEEDS');

		if (!feeds) return { success: false, message: 'No feeds to display.' };
		else return { success: true, message: feeds.join('\n') };
	}
}
