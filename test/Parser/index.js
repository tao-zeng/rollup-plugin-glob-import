const fs = require('fs');
const path = require('path');
const assert = require('assert');
const test = require('@nlib/test');
const promisify = require('@nlib/promisify');
const readFile = promisify(fs.readFile);
const Parser = require('../../lib/Parser');

test('Parser', (test) => {

	test('creates a parser', () => {
		return new Parser();
	});

	const testFilePath = path.join(__dirname, 'src', 'index.js');
	let testCode;

	test('load the test code', () => {
		return readFile(testFilePath, 'utf8')
		.then((code) => {
			testCode = code;
		});
	});

	test('Parser.prototype.parse', (test) => {

		const parser = new Parser();
		const {imports, exports} = parser.parse(testCode);

		test('imports', (test) => {
			test('finds 3 named imports', () => {
				assert.equal(imports.size, 3);
			});
			test('from ./b.js', (test) => {
				const map = imports.get('./b.js');
				test('has b.js', () => {
					assert(map);
				});
				test('default => b', () => {
					assert.equal(map.get('default'), 'b');
				});
			});
			test('from ./c.js', (test) => {
				const map = imports.get('./c.js');
				test('has c.js', () => {
					assert(map);
				});
				test('c => c', () => {
					assert.equal(map.get('c'), 'c');
				});
			});
			test('from ./de.js', (test) => {
				const map = imports.get('./de.js');
				test('has de.js', () => {
					assert(map);
				});
				test('d => dd', () => {
					assert.equal(map.get('d'), 'dd');
				});
				test('e => ee', () => {
					assert.equal(map.get('e'), 'ee');
				});
			});
		});

		test('exports', (test) => {
			test('default', () => {
				assert(exports.has('default'));
			});
			test('k', () => {
				assert(exports.has('k'));
			});
			test('ll', () => {
				assert(exports.has('ll'));
			});
			test('mm', () => {
				assert(exports.has('mm'));
			});
			test('nn', () => {
				assert(exports.has('nn'));
			});
			test('p', () => {
				assert(exports.has('p'));
			});
			test('q', () => {
				assert(exports.has('q'));
			});
			test('r', () => {
				assert(exports.has('r'));
			});
			test('s', () => {
				assert(exports.has('s'));
			});
		});

	});

});
