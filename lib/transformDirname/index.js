const path = require('path');
const toURLString = require('../toURLString');

function transformDirname(source, id) {
	return source.split('__dirname').join(toURLString(path.dirname(id)));
}

module.exports = transformDirname;
