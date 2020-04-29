function help() {
	return Promise.resolve({
		parse_mode: 'HTML',
		text: `
<strong>Command list</strong>

/order_taxi – order a taxi
/help - list of all commands

<strong>Feedback</strong>

Please do not hesitate to send me any questions or feedback via direct messages to @chuvee
		`
	});
}

module.exports = help;