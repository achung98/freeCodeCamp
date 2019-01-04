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
var ObjectId = require('mongodb').ObjectID;
var db;

const CONNECTION_STRING = process.env.DATABASE; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

 MongoClient.connect(CONNECTION_STRING, (err, database) => {
    if(err) return;
    else {
      db = database;
    }
});


module.exports = function (app) {
    app.route('/api/issues/:project')

      .get(function (req, res){
        var project = req.params.project;
        var query = req.query;
        db.listCollections({name: project})
          .next(function(err, col) {
            if (col) {
                db.collection(project).find(query).toArray((err, docs) => {
                  res.send(docs);
                });
            } else {
                db.createCollection(project);
                res.send(new Array());
            }
        });
      })

      .post(function (req, res){
        var project = req.params.project;
        let issue = {
          "issue_title": req.body.issue_title,
          "issue_text": req.body.issue_text,
          "created_on": new Date().toUTCString(),
          "updated_on": new Date().toUTCString(),
          "created_by": req.body.created_by,
          "assigned_to": req.body.assigned_to,
          "open": 'true',
          "status_text": req.body.status_text
        };

        db.collection(project).insertOne(issue, (err, doc) => {
          if(err)
            res.redirect("/");
          else
            res.json(issue);
        });
      })

      .put((req, res, next) => {
        if(req.body.issue_title == "" && req.body.issue_text == "" && req.body.created_by == "" && req.body.assigned_to == "" && req.body.status_text == "" && !req.body.open) {
          res.send("no updated field sent");
          return;
        }
        var updateFields = {"updated_on": new Date().toUTCString(),};
        if (req.body.issue_title != "" && req.body.issue_title != undefined) updateFields.issue_title = req.body.issue_title;
        if (req.body.issue_text != "" && req.body.issue_text != undefined) updateFields.issue_text = req.body.issue_text;
        if (req.body.created_by != "" && req.body.created_by != undefined) updateFields.created_by = req.body.created_by;
        if (req.body.assigned_to != "" && req.body.assigned_to != undefined) updateFields.created_by = req.body.created_by;
        if (req.body.status_text != "" && req.body.status_text != undefined) updateFields.status_text = req.body.status_text;
        if (req.body.open) updateFields.open = 'false';
        res.locals.updateFields = updateFields;
        next();
      },
       function (req, res) {
        var project = req.params.project;

        db.collection(project).findOneAndUpdate({_id: new ObjectId(req.body._id)},
                                                {$set: res.locals.updateFields},
        (err, doc) => {
          if(err)
            throw err;
          res.send("successfully updated");
        });
      })

      .delete(function (req, res){
        var project = req.params.project;

        db.collection(project).deleteOne({_id: new ObjectId(req.body._id)}, (err, doc) => {
           if(err)
             throw err;
           if(!doc.deletedCount) {
             res.send("deleted undefined");
             return;
           }
          res.send("succesfully deleted");
        });
      });
};
