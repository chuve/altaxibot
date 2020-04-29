const UserContextModel = require('../models/UserContextModel');
const TaxiOrderModel = require('../models/TaxiOrderModel');
const logger = require('../utils/logger.js');

STEPS = [
	step_where_to, // step 0
	step_where_from, // step 1
	step_price, // step 2
	step_confirmation, //step 3
	step_thank_you, //step 4
]

function cleanContext(message, context) {
	const step = {
		reply_markup: {
			remove_keyboard: true
		}
	}

	return UserContextModel.deleteOne({ user_id: message.from.id })
		.then(result => step);
}

// step 0
function step_where_to(message, context) {
	const step = {
		text: 'Where from?',
		reply_markup: {
			keyboard: [
				[{"text": "Cancel"}]
			],
			resize_keyboard: true
		}
	};

	return new Promise((resolve, reject) => {
		UserContextModel.updateOne({ user_id: message.from.id }, {
			user_id: message.from.id,
			current_skill: 'order_taxi',
			current_step: 0,
		}, { upsert: true }).then(result => {
			logger.log(`Scenario "orderTaxi" has been launched successfully for user ${result.user_id}`);
			resolve(step);
		}).catch(error => logger.log(error))
	});
}

// step 1
function step_where_from(message, context) {
	const step = {
		text: 'Where to?',
		reply_markup: {
			keyboard: [
				[{"text": "Cancel"}]
			],
			resize_keyboard: true
		}
	};

	return new Promise((resolve, reject) => {
		UserContextModel.updateOne({ user_id: message.from.id }, {
			$set: {
				current_step: 1,
				"context.from": message.text
			}
		}).then(result => {
			resolve(step);
		}).catch(error => logger.log(error))
	});
}

// step 2
function step_price(message, context) {
	const step = {
		text: 'What type?',
		reply_markup: {
			keyboard: [
				[
					{"text": "Economy: 83 RUB"}, 
					{"text": "Comfort: 175 RUB"},
					{"text": "Comfort+: 322 RUB"},
				],
				[
					{"text": "Cancel"},
				]
			],
			resize_keyboard: true
		}
	};

	return new Promise((resolve, reject) => {
		UserContextModel.updateOne({ user_id: message.from.id }, { 
			$set: {
				current_step: 2,
				"context.to": message.text
			}
		}).then(result => {
			resolve(step);
		}).catch(error => logger.log(error))
	});
}

// step 3
function step_confirmation(message, context) {
	const step = {
		parse_mode: 'HTML',
		text: `
<strong>Please confirm your order</strong>
From: ${context.context.from}
To: ${context.context.to}
Price: ${message.text}
		`,
		reply_markup: {
			keyboard: [
				[
					{"text": "Yes"},
					{"text": "Cancel"}
				]
			],
			resize_keyboard: true
		}
	};

	return new Promise((resolve, reject) => {
		UserContextModel.updateOne({ user_id: message.from.id }, { 
			$set: {
				current_step: 3,
				"context.price": message.text
			}
		}).then(result => {
			resolve(step);
		}).catch(error => logger.log(error))
	})
}

// step 4
function step_thank_you(message, context) {
	const step = (_id) => ({
		parse_mode: 'HTML',
		text: `
<strong>Order #${_id}</strong>
Thanks for your order. I will send you a message with car details when someone picks up your order.
`,
		reply_markup: {
			remove_keyboard: true
		}
	});

	return new Promise((resolve, reject) => {
		UserContextModel.updateOne({ user_id: message.from.id }, { 
			$set: {
				current_step: 4,
				"context.confirmation": message.text
			}
		})
		.then(result => TaxiOrderModel.create({
			user_id: context.user_id,
			from: context.context.from,
			to: context.context.to,
			price: context.context.price,
			status: 'pending',
			confirmation: message.text
		}))
		.then(result => {
			resolve(step(result._id));
		})
		.catch(error => logger.log(error))
	});
}

function orderTaxi(message, context) {
	if (!context) { // launch first step
		return STEPS[0](message, context)
	}

	if (message.text === 'Cancel') { // launch previous step
		return context.current_step !== 0 ? 
			STEPS[context.current_step - 1](message, context) : 
			cleanContext(message, context).then(result => ({
				text: 'Ok, next time...',
				reply_markup: {
					remove_keyboard: true
				}
			}));
	} else { // launch next step
		const nextStep = context.current_step + 1;
		return nextStep <= STEPS.length - 1 ? STEPS[nextStep](message, context) : cleanContext(message, context);
	}
}

module.exports = orderTaxi;