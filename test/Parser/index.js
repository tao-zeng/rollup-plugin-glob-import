const assert = require('assert');
const test = require('@nlib/test');
const Parser = require('../../lib/Parser');

test('Parser', (test) => {

	test('creates a parser', () => {
		return new Parser();
	});

	test('Parser.prototype.parse', (test) => {

		const code = [
			'import "a";',
			'import b from "b";',
			'import {c} from "c";',
			'import {d as dd, e as ee} from "de";',
			'export const p = 0;',
			'const q = {};',
			'const r = {};',
			'const s = {};',
			'export default q;',
			'export {q as qq, r as rr, s as ss};',
		].join('\n');

		const parser = new Parser();
		const {imports, exports} = parser.parse(code);

		test('imports', (test) => {
			test('finds 3 named imports', () => {
				assert.equal(imports.size, 3);
			});
			test('from "b"', (test) => {
				const b = imports.get('b');
				test('default => b', () => {
					assert.equal(b.get('default'), 'b');
				});
			});
			test('from "c"', (test) => {
				const c = imports.get('c');
				test('c => c', () => {
					assert.equal(c.get('c'), 'c');
				});
			});
			test('from "de"', (test) => {
				const de = imports.get('de');
				test('d => dd', () => {
					assert.equal(de.get('d'), 'dd');
				});
				test('e => ee', () => {
					assert.equal(de.get('e'), 'ee');
				});
			});
		});

		test('exports', (test) => {
			test('p', () => {
				assert(exports.has('p'));
			});
			test('default', () => {
				assert(exports.has('default'));
			});
			test('qq', () => {
				assert(exports.has('qq'));
			});
			test('rr', () => {
				assert(exports.has('rr'));
			});
			test('ss', () => {
				assert(exports.has('ss'));
			});
		});

	});

});
