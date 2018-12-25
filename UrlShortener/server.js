'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var unique = require('unique-number');
var bodyParser = require('body-parser');
var cors = require('cors');
var short = new unique();

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//Creating schema
const Schema = mongoose.Schema;
var schema = new Schema({
  original_url: String,
  short_url: Number
});

//Creating a model
var ShortUrl = mongoose.model('ShortUrl', schema);

app.post("/api/shorturl/new", /*middleware to check url*/(req, res, next) => {
  let temp = req.body.url;
    if(new RegExp("(?<=https?:\/\/)(www.)?.+\.com(\/\w+)*").test(temp)) {
      dns.lookup(temp.replace("https://", ""), (err, add, fam) => {
        if(err) {
          res.json({error: "Invalid URL"});
          return;
        }
        next();
      });
    } else {
      res.json({error: "Invalid URL"});
      return;
    }
  }, (req, res) => {
    let temp = req.body.url;
    ShortUrl.findOne({original_url: temp}, (err, data) => {
      //if url is not in the data base
      if(!data) {
        //create new document and save it to the database
        let tempNumber = short.generate();
        let newShortUrl = new ShortUrl({
          original_url: temp,
          short_url: tempNumber
        }).save((err, data) => {if(err) console.log("The hell"); console.log("Done!");});
        //respond
        res.json({original_url: temp, short_url: tempNumber});
        return;
      }
     //return the document
      res.json({original_url: data.original_url, short_url: data.short_url});
    });
});

//redirect to the url
app.get("/api/shorturl/:short_url", (req, res) => {
  let temp = req.params.short_url;
  //Find short url
  ShortUrl.findOne({short_url: temp}, (err, data) => {
      //if short url is not in the data base
      if(!data) {
        res.json({error: "URL does not exist"});
        return;
      }
     //redirect to site
      res.redirect(data.original_url);
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});
