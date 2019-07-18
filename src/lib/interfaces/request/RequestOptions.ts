/**
 * @interface RequestOptions
 * @description Interface for {@link RequestOptions}.
 */
/**
 * @name RequestOptions#uri
 * @description URI of the request.
 * @type {string}
 */
/**
 * @name RequestOptions#headers
 * @description Headers to accompany the request.
 * @type {Object[]}
 */
/**
 * @name RequestOptions#json
 * @description Boolean flag to set if you are expecting a JSON result.
 * @type {boolean}
 */

export default interface RequestOptions {
	uri: string;
	headers: { [key: string]: string }[];
	json: boolean;
}
