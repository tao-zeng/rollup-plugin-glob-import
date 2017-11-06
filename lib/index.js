const GlobImporter = require('./GlobImporter');

function globImport(params) {
	const globImporter = new GlobImporter(params);
	return {
		name: 'glob-import',
		resolveId(importee, importer) {
			return globImporter.resolveId(importee, importer);
		},
		load(id) {
			return globImporter.load(id);
		},
	};
}

module.exports = globImport;
