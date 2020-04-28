const mongoose = require('mongoose');


const UpdateModel = mongoose.model('update', new mongoose.Schema({
  update_id: Number,
  request: Object,
  response: Object,
  date: Date
}));

module.exports = UpdateModel;