/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
var db;
var collection;
 MongoClient.connect(MONGODB_CONNECTION_STRING, (err, database) => {
    if(err) throw err;
    db = database;
   collection = db.collection('books');
});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
        collection.find().toArray((err, docs) => {
        if(err) throw err;
        res.json(docs);
      });
    })

    .post(function (req, res){
      var title = req.body.title;
      if(title == "") {
        res.send("missing title");
        return;
      }
      var newBook = {"title": title, "comments": new Array(), "_id": new ObjectId()};
      collection.insertOne({"title": title, "comments": new Array(), "_id": new ObjectId(), "commentcount": 0});
      res.json(newBook);
    })

    .delete(function(req, res){
      collection.deleteMany({}, (err, succ) => {
        if(err) throw err;
        res.send("complete delete successful");
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      collection.findOne({"_id": new ObjectId(bookid)}, (err, doc) => {
        if(err) throw err;
        if(!doc) {
          res.send("no book exists");
          return;
        }
        res.json(doc);
      });
    })

    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      collection.findOne({"_id": new ObjectId(bookid)}, (err, doc) => {
        if(err) throw err;
        collection.update({"_id": new ObjectId(bookid)}, {$push: {comments: comment}});
        collection.update({"_id": new ObjectId(bookid)}, {$inc: {commentcount: 1}});
        res.send(doc);
      });
    })

    .delete(function(req, res){
      var bookid = req.params.id;
      collection.deleteOne({"_id": new ObjectId(bookid)}, (err, succ) => {
        if(err) throw err;
        res.send("delete successful");
      });
    });

};
