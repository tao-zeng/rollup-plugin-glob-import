const assert = require('assert');
const test = require('@nlib/test');
const path = require('path');
const vm = require('vm');
const fs = require('fs');
const {rollup} = require('rollup');
const globImport = require('../..');
const toURLString = require('../../lib/toURLString');
const transformDirname = require('../../lib/transformDirname');

test('binding', (test) => {

	const input = path.join(__dirname, 'src', 'index.js');
	const params = {};

	return test('bundle', () => {
		return rollup({
			input,
			plugins: [
				{transform: transformDirname},
				globImport({
					debug: true,
					load: (file) => {
						return Promise.resolve(transformDirname(fs.readFileSync(file, 'utf8'), file));
					},
				}),
				{
					transform(source, id) {
						if (id.includes('_deps1_-star-_js.js')) {
							params.deps1 = source;
						}
						if (id.includes('_deps2_-star-_js.js')) {
							params.deps2 = source;
						}
					},
				},
			],
		})
		.then((bundle) => {
			params.bundle = bundle;
		});
	})
	.then(() => {
		return test('check relative glob pattern', () => {
			assert.equal(
				params.deps1.trim(),
				[
					'import _0 from \'./deps1/a.js\';',
					'import _1 from \'./deps1/b.js\';',
					'export default {',
					'	a: _0,',
					'	b: _1',
					'};',
				].join('\n')
			);
		});
	})
	.then(() => {
		return test('check absolute glob pattern', () => {
			assert.equal(
				params.deps2.trim(),
				[
					`import _0 from '${toURLString(__dirname)}/src/deps2/c.js';`,
					`import _1 from '${toURLString(__dirname)}/src/deps2/d.js';`,
					'export default {',
					'	c: _0,',
					'	d: _1',
					'};',
				].join('\n')
			);
		});

	})
	.then(() => {
		return test('generate code', () => {
			return params.bundle.generate({format: 'es'})
			.then(({code}) => {
				params.code = code;
			});
		});
	})
	.then(() => {
		return test('run code', () => {
			params.result = {};
			vm.runInNewContext(params.code, {result: params.result});
		});
	})
	.then(() => {
		return test('test the result', () => {
			const expected = {
				a: 'a',
				b: 'b',
				c: 'c',
				d: 'd',
			};
			assert.deepEqual(params.result, expected);
		});
	});

});
