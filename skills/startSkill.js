function start() {
	return Promise.resolve({
		parse_mode: 'HTML',
		text: `
I can assist you to manage your daily routine.

You can control me by sending these commands:

/order_taxi – order a taxi
/help - list of all commands
		`
	});
}

module.exports = start;