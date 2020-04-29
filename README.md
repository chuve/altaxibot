# altaxibot

## How to launch the bot?

1. Run the application
```
docker-compose build
docker-compose up
```

2. Open the bot in Telegram app
[@altaxibot](https://telegram.me/altaxibot)

## How to add a new skill to the bot?

1. Create js module for the new skill in `./skills` directory

*./skills/helloWorldSkill.js*
```
function hello_world() {
	return Promise.resolve({
		parse_mode: 'HTML',
		text: `<strong>Hello World</strong>`
	});
}

module.exports = hello_world;
```

2. Update `./skills/index.js`
```

...
const helloWorld = require('./helloWorldSkill')

module.exports = [
    ...
    { command: 'hello_world', description: 'Say hi to the world', skill: helloWorld }
];
```

3. Restart the app

## How to add a new skill with steps?

Please use [orderTaxiSkill](https://github.com/chuve/altaxibot/blob/master/skills/orderTaxiSkill.js) as an example 🤯
