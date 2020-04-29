function start() {
	const skills = require('./index');
	skills_dict = skills.map(skill => `/${skill.command} – ${skill.description}`).join('\r\n');

	return Promise.resolve({
		parse_mode: 'HTML',
		text: `
I can assist you to manage your daily routine.

You can control me by sending these commands:

${skills_dict}
		`
	});
}

module.exports = start;