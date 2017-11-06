const path = require('path');
const promisify = require('@nlib/promisify');
const glob = promisify(require('glob'));
const toURLString = require('../toURLString');

function globFiles(importee, importer) {
	const importerDirectory = path.dirname(importer);
	const [globPattern, filePathToImportFrom] = path.isAbsolute(importee)
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
		return foundFiles
		.map((filePath) => {
			return [path.normalize(filePath), filePathToImportFrom(filePath)];
		});
	});
}

module.exports = globFiles;
