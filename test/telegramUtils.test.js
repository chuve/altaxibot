const assert = require('assert');
const telegramUtils = require('../utils/telegramUtils')

const { isolateEntitiesFromText } = telegramUtils;

describe('telegramUtils', () => {
  describe('isolateEntitiesFromText – should return object with entities if they exist in the text', () => {

    it('should return 1 entity with type "mention"', () => {
    	const text = "hello @chaykowskaya"
    	const entities = [
          {
            "offset": 6,
            "length": 13,
            "type": "mention"
          }
        ];
    	currentResult = isolateEntitiesFromText(text, entities);
    	expectedResult = {
    		"mention": "@chaykowskaya"
    	};
      assert.deepEqual(currentResult, expectedResult);
    });


    it('should return 1 entity with type "bot_command"', () => {
    	const text = '/start'
    	const entities = [
          {
            "offset": 0,
            "length": 6,
            "type": "bot_command"
          }
        ];
    	currentResult = isolateEntitiesFromText(text, entities);
    	expectedResult = {
    		"bot_command": "/start"
    	};
      assert.deepEqual(currentResult, expectedResult);
    });


    it('should return 2 entities with type "bot_command" and "mention"', () => {
    	const text = 'Hello /start and ask @chaykowskaya'
    	const entities = [
          {
            "offset": 6,
            "length": 6,
            "type": "bot_command"
          },
          {
            "offset": 21,
            "length": 13,
            "type": "mention"
          }
        ];
    	currentResult = isolateEntitiesFromText(text, entities);
    	expectedResult = {
    		"bot_command": "/start",
    		"mention": "@chaykowskaya"
    	};
      assert.deepEqual(currentResult, expectedResult);
    });

  });
});