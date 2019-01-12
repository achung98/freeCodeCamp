/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
//Get stocks and user models
let stocks = require('../stocks.js').stock;
let user = require('../user.js').user;
let Handler = require('../Handler.js');
let asyn = require('async');

//Check if ticket is corret
let cts = require('check-ticker-symbol');

var handler = new Handler();

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });
module.exports = function (app) {

  app.use((req, res, next) => {
    let stocks = Array.isArray(req.query.stock) ? req.query.stock : new Array(req.query.stock);
    for(const stock of stocks) {
      if(!cts.valid(stock.toUpperCase())) {
        res.send("Stock " + stock + " was not found");
        return;
      }
    }
    next();
  });

  app.route('/api/stock-prices')
    .get(function (req, res){
      let query = req.query;
      let stock = Array.isArray(req.query.stock) ? req.query.stock : new Array(req.query.stock);
      let like = req.query.like || false;
      let ip = String(req.ip);

      addIpOrUpdate(ip, stock, like);
      setTimeout(printData.bind(null, res, stock), 500);
  });
};

async function addIpOrUpdate(ip, stockArray, like) {
  for(const stock of stockArray) {
    //Find if the user has already used this application
    await handler.findUser(user, ip).then(doc => {
      if(doc == null)
        //Create new user in the database
        return handler.newIp(user, ip);
      else {
        //If the user is found, check if given stock is in his "likes" field
        handler.updateLikes(doc, stockArray.map(e => e.toUpperCase()), like);
        //Update the number of likes in the stock depending of the conditions
        findStockOrUpdateLikes(stock.toUpperCase(), handler.newLike(doc, stock.toUpperCase(), like));
      }
    }).then(doc => {
      //If the user is created succesfully
        if(doc) {
          //Check if given stock is in his "likes" field
          handler.updateLikes(doc, stockArray.map(e => e.toUpperCase()), like);
          //Update the number of likes in the stock depending of the conditions
          findStockOrUpdateLikes(stock.toUpperCase(), handler.newLike(doc, stock.toUpperCase(), like));
        }
       })
      .catch(err => console.log(err));
  }
}

//Add the likes to the stocks database
async function findStockOrUpdateLikes(stock, like) {
  await handler.addLike(stocks, stock, like);
}

async function printData(res, stockArray) {
  let docs;
  let obj;
  if(stockArray.length > 1) {
    docs = [];
    obj = {"stockData": []};
    for(const stock of stockArray) {
      await handler.findStock(stocks, stock.toUpperCase()).then(doc => docs.push(doc));
    };
    obj.stockData.push({
      stock: docs[0].stock,
      price: docs[0].price,
      rel_likes: docs[0].likes - docs[1].likes
    });
    obj.stockData.push({
      stock: docs[1].stock,
      price: docs[1].price,
      rel_likes: docs[1].likes - docs[0].likes
    });
  } else {
    obj = {"stockData": {}};
    await handler.findStock(stocks, stockArray[0].toUpperCase()).then(doc => {
      obj.stockData.stock = doc.stock;
      obj.stockData.price = doc.price;
      obj.stockData.likes = doc.likes;
    });
  }
  res.send(obj);
}
