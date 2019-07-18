/**
 * @interface Picture
 * @description Interface for NASA APoD's {@link Picture}.
 */
/**
 * @name Picture#title
 * @description Title of the NASA APoD's {@link Picture}.
 * @type {string}
 */
/**
 * @name Picture#desc
 * @description Explanation of the NASA APoD's {@link Picture}.
 * @type {string}
 */
/**
 * @name Picture#img
 * @description URL of the NASA APoD's {@link Picture}.
 * @type {string}
 */

export default interface Picture {
	title: string;
	desc: string;
	img: string;
}
