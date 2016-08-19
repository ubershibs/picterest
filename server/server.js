'use strict';
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var compress = require('compression');
var cors = require('cors');

require('./models/db');
var routes = require('./routes/index.js');

var app = express();

var options = {
  origin: 'http://ubershibs-picterest.herokuapp.com'
}
app.use(cors(options));
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routes);

// error handlers

// Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({"message" : err.name + ": " + err.message});
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
app.listen(port, process.env.IP, function(){
  console.log("Server listening on " + port);
});

module.exports = app;
