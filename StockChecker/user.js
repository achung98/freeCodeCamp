const mongoose = require('mongoose');

//Creating schema
let Schema = mongoose.Schema;
let userSchema = new Schema({
  "Ip": String,
  "likes": [String]
});

//Creating model
let user = mongoose.model('user', userSchema);

exports.user = user;
