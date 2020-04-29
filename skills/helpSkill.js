function help() {
	const skills = require('./index');
	skills_dict = skills.map(skill => `/${skill.command} – ${skill.description}`).join('\r\n');

	return Promise.resolve({
		parse_mode: 'HTML',
		text: `
<strong>Command list</strong>

${skills_dict}

<strong>Feedback</strong>

Please do not hesitate to send me any questions or feedback via direct messages to @chuvee
		`
	});
}

module.exports = help;