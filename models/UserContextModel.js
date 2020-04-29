const mongoose = require('mongoose');


const UserContextModel = mongoose.model('user_context', new mongoose.Schema({
	user_id: Object,
	current_skill: String,
	current_step: Number,
	context: Object
}));

module.exports = UserContextModel;