const mongoose = require('mongoose');


const TaxiOrderSkillModel = mongoose.model('taxi_order', new mongoose.Schema({
	user_id: Object,
	from: String,
	to: String,
	price: String,
	status: String
}));

module.exports = TaxiOrderSkillModel;