function shiftMap(map) {
	for (const [key, value] of map) {
		map.delete(key);
		return [key, value];
	}
	return undefined;
}

module.exports = shiftMap;
