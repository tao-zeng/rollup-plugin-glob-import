const assert = require('assert');
const test = require('@nlib/test');
const toURLString = require('../../lib/toURLString');

test('toURLString', (test) => {

	test('slash', (test) => {

		test('absolute', () => {
			const source = '/a/b/c';
			const expected = '/a/b/c';
			const actual = toURLString(source);
			assert.equal(actual, expected);
		});

		test('relative', () => {
			const source = 'a/b/c';
			const expected = './a/b/c';
			const actual = toURLString(source);
			assert.equal(actual, expected);
		});

	});

	if (process.platform.startsWith('win')) {

		test('backslash', (test) => {

			test('drive + absolute', () => {
				const source = 'C:\\a\\b\\c';
				const expected = '/a/b/c';
				const actual = toURLString(source);
				assert.equal(actual, expected);
			});

			test('absolute', () => {
				const source = '\\a\\b\\c';
				const expected = '/a/b/c';
				const actual = toURLString(source);
				assert.equal(actual, expected);
			});

			test('relative', () => {
				const source = 'a\\b\\c';
				const expected = './a/b/c';
				const actual = toURLString(source);
				assert.equal(actual, expected);
			});

		});
	}

});
