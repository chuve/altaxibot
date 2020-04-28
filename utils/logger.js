function log(message) {
	console.log(`${new Date(Date.now()).toLocaleString()} – ${message}`);
}

module.exports = {
	log
}