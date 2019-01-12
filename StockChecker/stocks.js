const mongoose = require('mongoose');

//Creating schema
let Schema = mongoose.Schema;
let stockSchema = new Schema({
  stock: String,
  price: String,
  likes: Number
});

//Creating model
let stock = mongoose.model('stock', stockSchema);

exports.stock = stock;
