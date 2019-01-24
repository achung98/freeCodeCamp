const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let Thread = new Schema({
    text: String,
    created_on: Date,
    bumped_on: Date,
    reported: Boolean,
    delete_password: String,
    replies: [{
      _id: Schema.Types.ObjectId,
      text: String,
      delete_password: String,
      created_on: Date,
      reported: Boolean
    }]
  });



module.exports = function(boardName) {
  return mongoose.model(boardName, Thread);
}
