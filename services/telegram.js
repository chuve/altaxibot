const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const queryString = require('query-string');

const logger = require('../utils/logger');
const telegramUtils = require('../utils/telegramUtils');
const config = require('../config');
const UpdateModel = require ('../models/UpdateModel');


const { BASE_URL, API_TOKEN, REQUEST_TIMEOUT, DB_NAME } = config;
const URL = `${BASE_URL}/${API_TOKEN}`;
const { isolateEntitiesFromText } = telegramUtils;


function sendReply(chat_id, reply_to_message_id, text) {
	return fetch(`${URL}/sendMessage`, {
        method: 'post',
        body:    JSON.stringify({
        	chat_id,
        	text,
        	reply_to_message_id
        }),
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(body => {
    	const result = body.result
    	logger.log(`The answer "${result.text}" has been sent to the chat ${result.chat.id}`);
    	return result
    });
};

function _applyBotCommand(bot_command, message) {
    return sendReply(message.from.id, message.message_id, 'I can order a taxi!')
}


function _hanleUpdate(update) {
    const { message } = update;
    isolateEntities = isolateEntitiesFromText(message.text, message.entities);
    if (isolateEntities['bot_command']) {
        return _applyBotCommand(isolateEntities['bot_command'], message)
    } else {
        return Promise.resolve();
    }
}

function _handleUpdates(updates) {
    return Promise.all(updates.map(update => new Promise((resolve, reject) => {
            _hanleUpdate(update)
                .then(response => UpdateModel.create({ 
                    update_id: update.update_id, 
                    request: update, 
                    response: response,
                    date: Date.now() 
                }))
                .then(result => {
                    logger.log(`The update ${update.update_id} has been processed`)
                    resolve();
                })
                .catch(error => {
                    logger.log(error)
                    reject();
                });
    })));
}

function getUpdates(params) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => { controller.abort(); },
      REQUEST_TIMEOUT,
    );

    return fetch(`${URL}/getUpdates?${queryString.stringify(params)}`, { signal: controller.signal })
            .then(res => res.json())
            .then(body => {
                return body.result ? _handleUpdates(body.result) : null;
            })
            .catch(error => {
                logger.log(error);
            })
            .finally(() => {
                clearTimeout(timeout);
            });    
};


module.exports = {
    sendReply,
    getUpdates
}