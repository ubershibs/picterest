'use strict';
var path = require('path');
var express = require('express');
var logger = require('morgan');

var app = express();

app.use(logger('dev'));
app.use(express.static('dist'));
//app.use('/bower_components', express.static('bower_components'));



// error handlers

// Catch unauthorised errors
app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err.stack);
  res.status(500);
  res.json({"message" : err.name + ": " + err.message});
});

var port = process.env.PORT || 9000;
app.listen(port, process.env.IP, function(){
  console.log("Server listening on " + port);
});

module.exports = app;
