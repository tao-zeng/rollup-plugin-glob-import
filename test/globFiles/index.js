const assert = require('assert');
const path = require('path');
const test = require('@nlib/test');
const globFiles = require('../../lib/globFiles');
const toURLString = require('../../lib/toURLString');
const filesDirectory = path.join(__dirname, 'files');
const importer = path.join(filesDirectory, 'index.js');
const absolutePrefix = toURLString(filesDirectory);

test('globFiles', (test) => {

	test('works with absolute glob patterns', () => {
		const pattern = path.join(filesDirectory, 'a.*.js');
		return globFiles(pattern, importer)
		.then((actual) => {
			const expected = [
				[path.join(filesDirectory, 'a.0.js'), `${absolutePrefix}/a.0.js`],
				[path.join(filesDirectory, 'a.1.js'), `${absolutePrefix}/a.1.js`],
			];
			assert.deepEqual(Array.from(actual), expected);
		});
	});

	test('works with relative glob patterns', () => {
		const pattern = './*.1.js';
		return globFiles(pattern, importer)
		.then((actual) => {
			const expected = [
				[path.join(filesDirectory, 'a.1.js'), './a.1.js'],
				[path.join(filesDirectory, 'b.1.js'), './b.1.js'],
			];
			assert.deepEqual(Array.from(actual), expected);
		});
	});

});
