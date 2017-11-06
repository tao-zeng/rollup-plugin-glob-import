const path = require('path');
const promisify = require('@nlib/promisify');
const glob = promisify(require('glob'));
const toURLString = require('../toURLString');

function globFiles(importee, importer) {
	const importerDirectory = path.dirname(importer);
	const [globPattern, filePathToimportee] = path.isAbsolute(importee)
	? [
		importee,
		toURLString,
	]
	: [
		path.join(importerDirectory, importee),
		(filePath) => {
			return toURLString(path.relative(importerDirectory, filePath));
		},
	];
	return glob(globPattern)
	.then((foundFiles) => {
		const result = new Map();
		for (const filePath of foundFiles) {
			result.set(path.normalize(filePath), filePathToimportee(filePath));
		}
		return result;
	});
}

module.exports = globFiles;
