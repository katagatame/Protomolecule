/**
 * @ignore
 * @interface DiscordConfig
 * @name Config:Discord
 * @description Interface for {@link Config:Discord} file.
 */
/**
 * @name Config:Discord#token
 * @description Aeden's unique Discord token.
 * @type {string}
 */
/**
 * @name Config:Discord#owner
 * @description Discord ID of the owner of Aeden.
 * @type {string[]}
 */
/**
 * @name Config:Discord#name
 * @description Aeden's name... Aeden.
 * @type {string}
 */
/**
 * @name Config:Discord#version
 * @description Aeden's version.
 * @type {string}
 */
/**
 * @name Config:Discord#status
 * @description Aeden's status.
 * @type {string}
 */

export default interface DiscordConfig {
	token: string;
	owner: string[];
	name: string;
	version: string;
	status: string;
}
