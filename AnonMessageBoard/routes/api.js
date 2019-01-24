/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

const DB = process.env.DB;
const mongoose = require('mongoose');
const board = require('../board.js');

mongoose.connect(DB, { useNewUrlParser: true });

module.exports = function (app) {

  app.route('/api/threads/:board')
    .get((req, res) => {
      let boardName = req.params.board;
      let thread = board(boardName);
      let response = [];
       thread.find({}).sort('-bumped_on').limit(10).exec((err, docs) => {
        docs.forEach(doc => {
          response.push({'_id': doc._id, 'text': doc.text, 'created_on': doc.created_on, 'bumped_on': doc.bumped_on, 'replies': doc.replies});
        });
         res.send(response);
      });
    })
    .post((req, res) => {
      let boardName = req.params.board;
      let thread = board(boardName);

      //Save thread in database
      new thread({
        text: req.body.text,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password: req.body.delete_password,
        replies: new Array()
      }).save().then(res.redirect('back'));
    })
    .put((req, res) => {
        let boardName = req.params.board;
        let thread = board(boardName);

        thread.updateOne({'_id': req.body.report_id}, {"reported": true}, (err, doc) => {
          res.send('reported');
        });
      })
    .delete((req, res) => {
      let boardName = req.params.board;
      let thread = board(boardName);

      thread.findById({'_id':req.body.thread_id}, (err, doc) => {
        if(doc.delete_password == req.body.delete_password) {
          thread.deleteOne({'_id': req.body.thread_id}, (err, succ) => {
            res.send('success');
          });
        } else
          res.send('incorrect password');
      });
    });

  app.route('/api/replies/:board')
    .get((req, res) => {
      let boardName = req.params.board;
      let thread = board(boardName);
      thread.findById(req.query.thread_id, (err, doc) => {
        res.send(doc);
      });
    })
    .post((req, res) => {
      let boardName = req.params.board;
      let thread = board(boardName);
      let reply = {
        _id: new mongoose.Types.ObjectId,
        text: req.body.text,
        delete_password: req.body.delete_password,
        created_on: new Date(),
        reported: false
      };

      thread.findById(req.body.thread_id, (err, doc) => {
          doc.updateOne({bumped_on: reply.created_on}).then(doc.updateOne({$push: {replies: reply}}).then(res.redirect('/b/'+boardName+'/'+req.body.thread_id)));
      });
    })
    .put((req, res) => {
      let boardName = req.params.board;
      let thread = board(boardName);

      thread.updateOne({"_id": req.body.thread_id, "replies._id": req.body.reply_id}, {$set: {"replies.$.reported": true}}, (err, doc) => {
        res.send('reported');
      });
    })
    .delete((req, res) => {
      let boardName = req.params.board;
      let thread = board(boardName);

      thread.findById({"_id": req.body.thread_id}, (err, doc) => {
        doc.replies.forEach(reply => {
          if(reply._id == req.body.reply_id) {
           if(reply.delete_password == req.body.delete_password) {
             reply.text = "['delete']";
             doc.save();
             res.send('success');
           } else
             res.send('incorrect password');
          }
        });
      });
    });

};
