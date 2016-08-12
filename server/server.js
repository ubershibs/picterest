'use strict';
var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var compress = require('compression');

require('./models/db');
var routes = require('./routes/index.js');

var corsOptions = {
  origin: 'http://localhost:9000'
};

var app = express();

app.use(logger('dev'));
app.use(compress());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'client'), { maxAge: 2628000000 }));
app.use('/', routes);

// error handlers

// Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  } else {
    next(err);
  }
});

app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err.stack);
  res.status(500);
  res.json({"message" : err.name + ": " + err.message});
});

var port = process.env.PORT || 3000;
app.listen(port, process.env.IP || "0.0.0.0", function(){
  console.log("Server listening on " + port);
});

module.exports = app;
