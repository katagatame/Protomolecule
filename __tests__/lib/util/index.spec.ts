import Util from '../../../src/lib/util';

describe('Util', (): void => {
	test('Pad Numerical String - single digit', (): void => {
		expect(Util.pad('0')).toEqual('00');
	});

	test('Pad Numerical String - double digit', (): void => {
		expect(Util.pad('34')).toEqual('34');
	});

	test('Is String Numerical? - true', (): void => {
		expect(Util.isNumerical('23')).toEqual(true);
	});

	test('Is String Numerical? - false', (): void => {
		expect(Util.isNumerical('ab3')).toEqual(false);
	});

	test('Does String Exist in Array? - true', (): void => {
		const array: string[] = ['drummer', 'miller', 'belter', 'expanse'];

		expect(Util.exists(array, 'drummer')).toEqual(true);
	});

	test('Does String Exist in Array? - false', (): void => {
		const array: string[] = ['drummer', 'miller', 'belter', 'expanse'];

		expect(Util.exists(array, 'dawes')).toEqual(false);
	});

	test('Does String Exist in Array? - false (empty array)', (): void => {
		const array: string[] = [];

		expect(Util.exists(array, 'dawes')).toEqual(false);
	});
});
