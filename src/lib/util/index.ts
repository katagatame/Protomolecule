/**
 * @module Util
 * @description Utility class containing static methods.
 */
export default class Util {
	/**
	 * @static
	 * @method pad
	 * @description Method to pad a numerical string.
	 * @param {string} n - The numerical string to pad.
	 * @returns {string} The padded string.
	 */
	public static pad(n: string): string {
		return Number(n) < 10 ? `0${n}` : n;
	}

	/**
	 * @static
	 * @method isNumerical
	 * @description Method to check if a string is numerical.
	 * @param {string | number} s - The string to check.
	 * @returns {boolean} Is the string numerical?
	 */
	public static isNumerical(s: string | number): s is number {
		return !Number.isNaN(Number(s.toString()));
	}

	/**
	 * @static
	 * @method exists
	 * @description Method to check if a string exists in an array.
	 * @param {string[]} array - The array to check.
	 * @param {string} item - The string to check for.
	 * @returns {boolean} Exists in array?
	 */
	public static exists(array: string[], item: string): boolean {
		return Boolean(array.find((a): boolean => a === item));
	}
}
