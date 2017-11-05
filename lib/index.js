const path = require('path');
const {createFilter} = require('rollup-pluginutils');
const promisify = require('@nlib/promisify');
const glob = promisify(require('glob'));
const toURLString = require('./toURLString');
const pseudoFileName = require('./pseudoFileName');
const shiftMap = require('./shiftMap');
const Parser = require('./Parser');

function globImport({
	include,
	exclude,
	acorn,
	load,
} = {}) {
	const filter = createFilter(include, exclude);
	const generatedCodes = new Map();
	const parser = new Parser({acorn, load});
	return {
		name: 'glob-import',
		resolveId(importee, importer) {
			if (!filter(importee) || !importee.includes('*')) {
				return null;
			}
			const importeeIsAbsolute = path.isAbsolute(importee);
			const importerDirectory = path.dirname(importer);
			const globPattern = importeeIsAbsolute ? importee : path.join(importerDirectory, importee);
			return Promise.all([
				glob(globPattern)
				.then((foundFiles) => {
					return foundFiles.reduce(
						importeeIsAbsolute
						? (map, filePath) => {
							map.set(filePath, toURLString(filePath));
							return map;
						}
						: (map, filePath) => {
							map.set(filePath, toURLString(path.relative(importerDirectory, filePath)));
							return map;
						},
						new Map()
					);
				}),
				parser.parse(importer),
			])
			.then(([foundFiles, {imports}]) => {
				const lines = [];
				const importSpecifiers = imports && imports.get(importee);
				if (importSpecifiers) {
					const bigObject = importSpecifiers.has('default') && new Map();
					return new Promise((resolve, reject) => {
						function parse() {
							const [filePath, moduleName] = shiftMap(foundFiles);
							const internalDefaultName = `_${foundFiles.size}_default`;
							const internalModuleName = `_${foundFiles.size}_modules`;
							parser.parse(filePath)
							.then(({exports}) => {
								let defaultImported = false;
								const matched = new Map();
								for (const [importedName, localName] of importSpecifiers) {
									if (exports.has(importedName)) {
										if (importedName === 'default') {
											defaultImported = true;
											lines.push(`import ${internalDefaultName} from '${moduleName}';`);
											lines.push(`export const ${localName} = ${internalDefaultName};`);
										} else {
											matched.set(localName, importedName);
										}
									}
								}
								if (0 < matched.size) {
									lines.push(`export {${
										Array.from(matched)
										.map(([exportName, localName]) => {
											return `${localName} as ${exportName}`;
										})
										.join(', ')
									}} from '${moduleName}';`);
								}
								if (bigObject) {
									lines.push(`import * as ${internalModuleName} from '${moduleName}';`);
									if (exports.has('default')) {
										if (!defaultImported) {
											lines.push(`import ${internalDefaultName} from '${moduleName}';`);
										}
										lines.push(`${internalModuleName}.default = ${internalDefaultName};`);
									}
									const key = path.basename(filePath, path.extname(filePath)).replace(/[^\w]/g, '-');
									bigObject.set(internalModuleName, key);
								}
							})
							.then(
								() => {
									if (0 < foundFiles.size) {
										parse();
									} else {
										resolve();
									}
								},
								reject
							);
						}
						parse();
					})
					.then(() => {
						if (bigObject) {
							lines.push('export default {');
							lines.push(
								Array.from(bigObject)
								.map(([internalVariableName, key]) => {
									return `  ${key}: ${internalVariableName}`;
								}).join(',\n')
							);
							lines.push('};');
						}
						return lines;
					});
				}
				for (const [, moduleName] of foundFiles) {
					lines.push(`import '${moduleName}';`);
				}
				return lines;
			})
			.then((lines) => {
				const pseudoPath = path.join(importerDirectory, pseudoFileName(importee));
				generatedCodes.set(pseudoPath, lines.join('\n'));
				return pseudoPath;
			});
		},
		load(id) {
			if (generatedCodes.has(id)) {
				const code = generatedCodes.get(id);
				generatedCodes.delete(id);
				return code;
			}
			return null;
		},
	};
}

module.exports = globImport;
