'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');

require('./models/db');
var routes = require('./routes/index.js');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ credentials: false, origin: 'https://ubershibs-picterest.herokuapp.com' }));
app.use('/', routes);
// error handlers

// Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.sendStatus(401).json({'message' : err.name + ': ' + err.message});
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
  res.json({'message' : err.name + ': ' + err.message});
});

var port = process.env.PORT || 3000;
app.listen(port, process.env.IP, function(){
  console.log('Server listening on ' + port);
});

module.exports = app;
