const assert = require('assert');
const path = require('path');
const console = require('console');
const test = require('@nlib/test');
const globFiles = require('../../lib/globFiles');
const toURLString = require('../../lib/toURLString');
const filesDirectory = path.join(__dirname, 'files');
const importer = path.join(filesDirectory, 'index.js');
const absolutePrefix = toURLString(filesDirectory);

test('globFiles', (test) => {

	test('works with absolute glob patterns', (test) => {
		const pattern = path.join(filesDirectory, 'a.*.js');
		return globFiles(pattern, importer)
		.then((result) => {
			console.log(result);
			test('finds 2 files', () => {
				assert.equal(result.size, 2);
			});
			test('has a.0.js', () => {
				assert(result.has(path.join(filesDirectory, 'a.0.js')));
			});
			test('has expected a.0.js', () => {
				const actual = result.get(path.join(filesDirectory, 'a.0.js'));
				const expected = `${absolutePrefix}/a.0.js`;
				assert.equal(actual, expected);
			});
			test('has a.1.js', () => {
				assert(result.has(path.join(filesDirectory, 'a.1.js')));
			});
			test('has expected a.1.js', () => {
				const actual = result.get(path.join(filesDirectory, 'a.1.js'));
				const expected = `${absolutePrefix}/a.1.js`;
				assert.equal(actual, expected);
			});
		});
	});

	test('works with relative glob patterns', (test) => {
		const pattern = './*.1.js';
		return globFiles(pattern, importer)
		.then((result) => {
			console.log(result);
			test('finds 2 files', () => {
				assert.equal(result.size, 2);
			});
			test('has a.1.js', () => {
				assert(result.has(path.join(filesDirectory, 'a.1.js')));
			});
			test('has expected a.1.js', () => {
				const actual = result.get(path.join(filesDirectory, 'a.1.js'));
				const expected = './a.1.js';
				assert.equal(actual, expected);
			});
			test('has b.1.js', () => {
				assert(result.has(path.join(filesDirectory, 'b.1.js')));
			});
			test('has expected b.1.js', () => {
				const actual = result.get(path.join(filesDirectory, 'b.1.js'));
				const expected = './b.1.js';
				assert.equal(actual, expected);
			});
		});
	});

});
