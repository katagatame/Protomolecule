/**
 * @ignore
 * @constant
 * @name Constants
 * @description Constant variables used throughout the client.
 * @type {Constants}
 */

import Constants from '../lib/interfaces/Constants';

const constants: Constants = {
	// bot info
	embedColorBase: '3656b3',

	// rss feeds
	rssFeedXkcd: 'https://xkcd.com/info.0.json',

	// urls
	urlXkcd: 'https://xkcd.com/',
	urlApod: 'https://apod.nasa.gov/apod/astropix.html',
	urlApodImgBase: 'https://apod.nasa.gov/apod/',
	urlApodRandom: 'https://apod.nasa.gov/apod/ap',

	bookEmoji: [],
	showEmoji: [],

	reValidateUrl: new RegExp(
		/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
	)
};

export default constants;
