const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const short = require('shortid');
const cors = require('cors');

const mongoose = require('mongoose');
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' );

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

//add new user
//Create user schema
let Schema = mongoose.Schema;
let user = new Schema({
  username: {type: String, required: true, unique: true},
  _id: {type: String, default: short.generate},
  description: String,
  duration: Number,
  date: Date
});
//Create new model
let userList = mongoose.model('User', user);

//ValidationError
var ValidationError = mongoose.Error.ValidationError;

//Repeated username error handling middleware
user.post('save', (err, doc, next) => {
  if (err.name === 'MongoError' && err.code === 11000) {
    err.__message = "Username already taken";
    next(err);
  } else if(err.name === 'ValidationError') {
    let error = new ValidationError(this);
    error.__message = "Path 'username' required";
    next(error);
  } else {
    next(err);
  }
});

//Save new user
app.post("/api/exercise/new-user", (req, res) => {
  let temp = req.body;
  userList.create(temp, (err, data) => {
    if(err) {
      res.send(err.__message);
      return;
    } else
      res.json({username: data.username, id: data._id});
  });
});

//Add exercises
app.post("/api/exercise/add", 
   /*middleware to check if inputs are empty or not*/
  (req, res, next) => {
    if(req.body.description === "") {
      res.send("Description required");
      return;
    } else if(req.body.duration === "") {
      res.send("Duration required");
      return;
    } else if(!Number(req.body.duration)) {
      res.send("Duration must be a number");
      return;
    }
  next();
  },   
  (req, res) => {
  let updateFields = {
    description: req.body.description, 
    duration: req.body.duration, 
    date: req.body.date || new Date()
  };
  userList.findByIdAndUpdate({_id: req.body.userId}, {$set: updateFields}, {new: true}).exec((err, data) => {
    if(!data) {
      res.send("Id not found");
      return; 
    }
    let stringDate = data.date.toUTCString();
    res.json({username: data.username, description: data.description, duration: data.duration, id: data._id, date: stringDate.substring(0, 11)});
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
