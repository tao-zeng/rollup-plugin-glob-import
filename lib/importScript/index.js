const toURLString = require('../toURLString');

function importScript(importee, internalName, externalName, specifiers = [], varName) {
	return [
		`import ${internalName} from '${toURLString(importee)}';`,
		`export const ${externalName} = ${varName}.${externalName} = ${internalName};`,
		...specifiers
		.map((name) => {
			return [
				`export const ${name} = ${varName}.${name} = ${internalName}.${name};`,
			].join('\n');
		}),
	].join('\n');
}

module.exports = importScript;
