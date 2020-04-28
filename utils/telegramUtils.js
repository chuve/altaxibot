function isolateEntitiesFromText(text, entities=[]) {
	isolateEntities = {};
	entities.forEach(entity => {
		isolateEntities[entity.type] = text.slice(entity.offset, entity.offset + entity.length);
	});
	return isolateEntities
}

module.exports = {
	isolateEntitiesFromText
}