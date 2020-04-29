const mongoose = require('mongoose');


const UpdateModel = mongoose.model('update', new mongoose.Schema({
	update_id: Number,
	request: Object,
	response: Object,
	created_at: Date
}));

module.exports = UpdateModel;