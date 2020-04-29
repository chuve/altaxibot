const start = require('./startSkill')
const help = require('./helpSkill')
const orderTaxi = require('./orderTaxiSkill')

module.exports = [
    { command: 'start', description: 'Welcome message', skill: start },
    { command: 'help', description: 'Help message', skill: help },
    { command: 'order_taxi', description: 'Order a taxi', skill: orderTaxi }
];