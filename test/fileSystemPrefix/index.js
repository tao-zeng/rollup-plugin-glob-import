const assert = require('assert');
const test = require('@nlib/test');
const path = require('path');
const fileSystemPrefix = require('../../lib/fileSystemPrefix');

test('fileSystemPrefix', (test) => {

	test('has no parent', () => {
		assert.equal(path.join(fileSystemPrefix, '..'), fileSystemPrefix);
	});

});
