const path = require('path');
const {createFilter} = require('rollup-pluginutils');
const pseudoFileName = require('../pseudoFileName');
const shiftMap = require('../shiftMap');
const globFiles = require('../globFiles');
const Parser = require('../Parser');

class GlobImporter extends Map {

	constructor({
		include,
		exclude,
		acorn,
		load,
	} = {}) {
		Object.assign(
			super(),
			{
				filter: createFilter(include, exclude),
				parser: new Parser({acorn, load}),
			}
		);
	}

	isTarget(importee) {
		return this.filter(importee) && importee.includes('*');
	}

	resolveId(importee, importer) {
		if (this.isTarget(importee)) {
			const importerDirectory = path.dirname(importer);
			return Promise.all([
				globFiles(importee, importer),
				this.parser.parseFile(importer),
			])
			.then(([foundFiles, {imports}]) => {
				const lines = [];
				const importSpecifiers = imports && imports.get(importee);
				if (importSpecifiers) {
					const bigObject = importSpecifiers.has('default') && new Map();
					return new Promise((resolve, reject) => {
						const parse = () => {
							const [filePath, moduleName] = shiftMap(foundFiles);
							const internalDefaultName = `_${foundFiles.size}_default`;
							const internalModuleName = `_${foundFiles.size}_modules`;
							this.parser.parse(filePath)
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
						};
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
				this.set(pseudoPath, lines.join('\n'));
				return pseudoPath;
			});
		}
		return null;
	}

	load(id) {
		return this.get(id);
	}

}

module.exports = GlobImporter;
