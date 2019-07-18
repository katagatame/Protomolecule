import { MessageEmbed } from 'discord.js';

import constants from '../Constants';
import Comic from '../interfaces/nerd/Comic';
import Picture from '../interfaces/nerd/Picture';
import RequestOptions from '../interfaces/request/RequestOptions';

import * as cheerio from 'cheerio';
import * as req from 'request-promise';

/**
 * @module Nerd
 * @description Utility class containing static methods for the Nerd commands.
 */
export default class Nerd {
	/**
	 * @static
	 * @async
	 * @method fetchApod
	 * @description Method to fetch APoD {@link Picture Pictures}.
	 * @param {boolean?} isRandom - Are we fetching a random APoD {@link Picture}?
	 * @returns {Promise<MessageEmbed>} The APoD {@link MessageEmbed}.
	 */
	public static async fetchApod(isRandom: boolean): Promise<MessageEmbed> {
		const uri: string = isRandom ? this.getRandomApodUri() : constants.urlApod;

		const options: RequestOptions = {
			uri: uri,
			headers: [{ Connection: 'keep-alive' }],
			json: true
		};

		return new Promise((resolve, reject): void => {
			req(options)
				.then((body): void => {
					const item: Picture = this.processApod(cheerio.load(body), uri);
					resolve(this.createApodEmbed(item));
				})
				.catch(function _reject(err?): void {
					reject(err);
				});
		});
	}

	/**
	 * @static
	 * @method getRandomApodUri
	 * @description Method to generate a random URI from NASA's APoD archives.
	 * @returns {string} The URI for a random NASA APoD {@link Picture}.
	 */
	private static getRandomApodUri(): string {
		const now: Date = new Date();
		const min: number = new Date(1995, 5, 16).getTime();
		const max: number =
			new Date(
				now.getUTCFullYear(),
				now.getUTCMonth(),
				now.getUTCDate(),
				18,
				59,
				59,
				999
			).getTime() -
			5 * 60 * 60 * 1000;
		const mMin: number = new Date(1995, 5, 17).getTime();
		const mMax: number = new Date(1995, 5, 19, 23, 59, 59, 999).getTime();

		let rDate: number = Math.round(min + Math.random() * (max - min));
		while (rDate >= mMin && rDate <= mMax) {
			rDate = Math.round(min + Math.random() * (max - min));
		}

		const randomDate: Date = new Date(rDate);
		const rDay: string = (0 + randomDate.getDate().toString()).slice(-2);
		const rMonth: string = (0 + (randomDate.getMonth() + 1).toString()).slice(
			-2
		);
		const rYear: string = randomDate.getFullYear().toString();

		return `${constants.urlApodRandom}${rYear.slice(-2)}${rMonth}${rDay}.html`;
	}

	/**
	 * @static
	 * @method processApod
	 * @description Method create an {@link Picture} from a `CheerioStatic` item.
	 * @param {cheerio.CheerioStatic} $ - The `CheerioStatic` item to process into an {@link Picture}.
	 * @param {string} uri - The URI of the APoD.
	 * @returns {Picture} The processed {@link Picture}.
	 */
	private static processApod($: CheerioStatic, uri: string): Picture {
		const title: string = $('center + center > b:first-child')
			.text()
			.trim();
		const img: string = $('img').attr('src');
		let desc: string = $('center + center + p')
			.text()
			.trim()
			.replace(/(\s)+/g, ' ')
			.replace(/(\r\n|\n|\r)/gm, '')
			.replace(/(Explanation:)/, '');

		desc = desc === '' ? '*There is no description for this content.*' : desc;
		desc =
			desc.length > 250
				? `${desc.substring(0, 250)}... [read more »](${uri})`
				: desc;

		return {
			title: title,
			img: constants.urlApodImgBase + img,
			desc: desc
		};
	}

	/**
	 * @static
	 * @method createApodEmbed
	 * @description Method to create a {@link MessageEmbed} for a specific {@link Picture}.
	 * @param {Picture} item - The {@link Picture} item to create a {@link MessageEmbed} from.
	 * @returns {MessageEmbed} The created NASA APoD {@link MessageEmbed}.
	 */
	private static createApodEmbed(item: Picture): MessageEmbed {
		return new MessageEmbed()
			.setAuthor(item.title)
			.setImage(item.img)
			.setDescription(item.desc);
	}

	/**
	 * @static
	 * @async
	 * @method fetchComic
	 * @description Method to fetch XKCD comics.
	 * @param {number?} n - The number of the comic to fetch.
	 * @param {boolean?} isRandom - Are we fetching a random comic?
	 * @returns {Promise<MessageEmbed>} The XKCD Comic `MessageEmbed`.
	 */
	public static async fetchComic(
		n?: number,
		isRandom?: boolean
	): Promise<MessageEmbed> {
		let uri = constants.rssFeedXkcd;

		if (isRandom) {
			const currentComicCount = await this.fetchCurrentComicCount();
			const randomComicNumber = Math.floor(
				Math.random() * currentComicCount + 1
			);
			uri = `${constants.urlXkcd}/${randomComicNumber}/info.0.json`;
		}

		if (n) uri = `${constants.urlXkcd}/${n}/info.0.json`;

		const options = {
			uri: uri,
			headers: [{ Connection: 'keep-alive' }],
			json: true
		};

		return new Promise((resolve, reject): void => {
			req(options)
				.then((item: Comic): void => {
					resolve(this.createXkcdEmbed(item));
				})
				.catch(function _reject(err?: string | undefined): void {
					reject(err);
				});
		});
	}

	/**
	 * @static
	 * @method createXkcdEmbed
	 * @description Method create a `MessageEmbed` for a specific {@link Comic}.
	 * @param {Comic} item - The {@link Comic} item to create a `MessageEmbed` from.
	 * @returns {MessageEmbed} The created XKCD Comic `MessageEmbed`.
	 */
	private static createXkcdEmbed(item: Comic): MessageEmbed {
		return new MessageEmbed()
			.setTitle(`xkcd: ${item.title}`)
			.setURL(`${constants.urlXkcd}${item.num}/`)
			.setImage(item.img)
			.setFooter(item.alt);
	}

	/**
	 * @static
	 * @async
	 * @method fetchCurrentComicCount
	 * @description Method to fetch the current amount of comics.
	 * @returns {number} The current amount of comics.
	 */
	private static async fetchCurrentComicCount(): Promise<number> {
		const options: RequestOptions = {
			uri: constants.rssFeedXkcd,
			headers: [{ Connection: 'keep-alive' }],
			json: true
		};

		return new Promise((resolve, reject): void => {
			req(options)
				.then((item: Comic): void => {
					resolve(item.num);
				})
				.catch(function _reject(err?): void {
					reject(err);
				});
		});
	}
}
