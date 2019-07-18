/**
 * @interface Result
 * @description Interface for {@link Result}.
 */
/**
 * @name RequestOptions#success
 * @description Boolean success.
 * @type {boolean}
 */
/**
 * @name RequestOptions#message
 * @description The message to accompany the result.
 * @type {string}
 */

export default interface Result {
	success: boolean;
	message: string;
}
