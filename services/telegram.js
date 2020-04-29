const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const queryString = require('query-string');

const logger = require('../utils/logger');
const telegramUtils = require('../utils/telegramUtils');
const config = require('../config');
const UpdateModel = require ('../models/UpdateModel');
const UserContextModel = require('../models/UserContextModel');
const skills = require('../skills')

const { BASE_URL, API_TOKEN, REQUEST_TIMEOUT, DB_NAME } = config;
const { isolateEntitiesFromText } = telegramUtils;

const URL = `${BASE_URL}/${API_TOKEN}`;

// support skills
const SKILLS = skills.reduce(function(commands, skill) {
    commands[`${skill.command}`] = skill.skill
    return commands;
}, {});

function sendMessage(message) {
	return fetch(`${URL}/sendMessage`, {
        method: 'post',
        body:    JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(body => {
    	const result = body.result
    	logger.log(`The answer has been sent to the chat ${result.chat.id}`);
    	return result
    })
    .catch(error => {
        logger.log(error);
    });
};

function setMyCommands(commands) {
    const body = { commands }
    return fetch(`${URL}/setMyCommands`, {
        method: 'post',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(body => {
        const result = body.result
        logger.log(`Skills have been setuped successfully`);
        return result
    })
    .catch(error => {
        logger.log(error);
    });
};

function _applyBotCommand(bot_skill, message) {
    return SKILLS[bot_skill](message)
        .then(step => sendMessage({ chat_id: message.from.id, ...step}));
}

function _textProcessing(message) {
    return UserContextModel.findOne({ user_id: message.from.id })
        .then(userContext => {
            if (userContext) {
                const skill = SKILLS[userContext.current_skill];
                return skill(message, userContext)
                    .then(step => {
                        sendMessage({chat_id: message.from.id, ...step})
                    })
            }
            return sendMessage({chat_id: message.from.id, ...SKILLS['help']()})
        });
}

function _handleUpdate(update) {
    const message = update.message || update.edited_message;
    isolateEntities = isolateEntitiesFromText(message.text, message.entities);
    bot_command = isolateEntities['bot_command'] ? isolateEntities['bot_command'].slice(1,) : null;

    if (bot_command && Object.keys(SKILLS).includes(bot_command)) {
        // User context removed every time when user apply new command 
        return UserContextModel.deleteOne({ user_id: message.from.id })
            .then(result => _applyBotCommand(bot_command, message));
    }
    
    return _textProcessing(message);
}

function _handleUpdates(updates) {
    return Promise.all(updates.map(update => new Promise((resolve, reject) => {
            _handleUpdate(update)
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
    setMyCommands,
    getUpdates,
    sendMessage
}