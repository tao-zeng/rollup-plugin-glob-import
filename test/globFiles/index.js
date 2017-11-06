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
			const pathToA0 = path.join(filesDirectory, 'a.0.js');
			test(`has ${pathToA0}`, () => {
				assert(result.has(pathToA0));
			});
			test(`has expected ${pathToA0}`, () => {
				const actual = result.get(pathToA0);
				const expected = `${absolutePrefix}/a.0.js`;
				assert.equal(actual, expected);
			});
			const pathToA1 = path.join(filesDirectory, 'a.1.js');
			test(`has ${pathToA1}`, () => {
				assert(result.has(path.join(filesDirectory, 'a.1.js')));
			});
			test(`has expected ${pathToA1}`, () => {
				const actual = result.get(pathToA1);
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
			const pathToA1 = path.join(filesDirectory, 'a.1.js');
			test(`has ${pathToA1}`, () => {
				assert(result.has(path.join(filesDirectory, 'a.1.js')));
			});
			test(`has expected ${pathToA1}`, () => {
				const actual = result.get(pathToA1);
				const expected = './a.1.js';
				assert.equal(actual, expected);
			});
			const pathToB1 = path.join(filesDirectory, 'b.1.js');
			test(`has ${pathToB1}`, () => {
				assert(result.has(pathToB1));
			});
			test(`has expected ${pathToB1}`, () => {
				const actual = result.get(pathToB1);
				const expected = './b.1.js';
				assert.equal(actual, expected);
			});
		});
	});

});
