const mongoose = require('mongoose');
const logger = require('./utils/logger');
const config = require('./config');
const telegram = require('./services/telegram')
const UpdateModel = require ('./models/UpdateModel')
const skills = require('./skills')

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB
} = process.env;

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
	.then( function() {
  		logger.log('MongoDB is connected');
	})
	.catch( function(err) {
  		logger.log(err);
  	});


(function initTelegramBot() {
	function pooling() {
		UpdateModel.findOne({}, 'update_id', {sort:{'_id':-1}}).then(result => {
			const params = {}
			result ? params['offset'] = result.update_id + 1 : null
			telegram.getUpdates(params)
				.finally(() => pooling())
		});
	}

	commands = skills.reduce(function(commands, skill) {
	    commands['command'] = skill.command
	    commands['description'] = skill.description
	    return commands;
	}, {});

	telegram.setMyCommands(commands)
		.then(() => pooling())
})();
