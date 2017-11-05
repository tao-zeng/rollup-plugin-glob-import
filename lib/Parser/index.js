const fs = require('fs');
const acorn = require('acorn');
const promisify = require('@nlib/promisify');
const readFile = promisify(fs.readFile);

class Parser extends Map {

	constructor({
		acorn = {},
		load = (file) => {
			return readFile(file, 'utf8');
		},
	}) {
		super();
		Object.assign(
			this,
			{
				load,
				acorn,
			}
		);
	}

	_parse(filePath) {
		return this.load(filePath)
		.then((code) => {
			const ast = acorn.parse(
				code,
				Object.assign(
					{ecmaVersion: 8},
					this.acorn,
					{sourceType: 'module'}
				)
			);
			const imports = new Map();
			const exports = new Set();
			for (const node of ast.body) {
				switch (node.type) {
				case 'ImportDeclaration':
					if (0 < node.specifiers.length) {
						imports.set(
							node.source.value,
							node.specifiers
							.reduce((map, {type, imported, local}) => {
								map.set(
									type === 'ImportDefaultSpecifier' ? 'default' : imported.name,
									local.name
								);
								return map;
							}, new Map())
						);
					}
					break;
				case 'ExportNamedDeclaration':
					if (node.declaration) {
						for (const {id} of node.declaration.declarations) {
							exports.add(id.name);
						}
					} else if (node.specifiers) {
						for (const {exported} of node.specifiers) {
							exports.add(exported.name);
						}
					}
					break;
				case 'ExportDefaultDeclaration':
					exports.add('default');
					break;
				case 'ExportAllDeclaration':
					// console.log(node);
					break;
				default:
				}
			}
			const result = {
				imports,
				exports,
			};
			this.set(filePath, result);
			return result;
		});
	}

	parse(filePath) {
		return (
			this.has(filePath)
			? Promise.resolve(this.get(filePath))
			: this._parse(filePath)
		);
	}

}

module.exports = Parser;
