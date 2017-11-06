const path = require('path');
const toURLString = require('../../lib/toURLString');

function translateDirectoryName(source, id) {
	return source.split('__dirname').join(toURLString(path.dirname(id)));
}

module.exports = translateDirectoryName;

const assert = require('assert');
const test = require('@nlib/test');

test('transformDirectoryName', (test) => {

	test('translates every __dirname', () => {
		const actual = translateDirectoryName(
			'_dirname, __dirname, ___dirname',
			'/a/b/c/d'
		);
		const expected = '_dirname, /a/b/c, _/a/b/c';
		assert.equal(actual, expected);
	});

});
