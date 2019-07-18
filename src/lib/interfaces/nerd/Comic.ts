/**
 * @interface Comic
 * @description Interface for XKCD {@link Comic}.
 */
/**
 * @name Comic#num
 * @description The number of the comic.
 * @type {number}
 */
/**
 * @name Comic#title
 * @description The title of the comic.
 * @type {string}
 */
/**
 * @name Comic#img
 * @description The comic image.
 * @type {string}
 */
/**
 * @name Comic#alt
 * @description The comic's hilarious alt text.
 * @type {string}
 */

export default interface Comic {
	num: number;
	title: string;
	img: string;
	alt: string;
}
