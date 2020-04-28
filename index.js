const mongoose = require('mongoose');
const logger = require('./utils/logger');
const config = require('./config');
const telegram = require('./services/telegram')
const UpdateModel = require ('./models/UpdateModel')


const { DB_NAME } = config;


mongoose.connect(`mongodb://localhost/${DB_NAME}`,
	{ useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  logger.log('Connection to db opened successfully');
});

function pooling() {
	UpdateModel.findOne({}, 'update_id', {sort:{'_id':-1}}).then(result => {
		const params = {}
		result ? params['offset'] = result.update_id + 1 : null
		telegram.getUpdates(params)
			.finally(() => pooling())
	});
}

pooling();