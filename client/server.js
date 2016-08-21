'use strict';
var express = require('express');
var logger = require('morgan');

var app = express();
app.use(logger('dev'));

app.use(express.static('dist'));

app.use('/scripts', express.static('scripts'));
app.use('/styles', express.static('styles'));
app.use('/images', express.static('images'));
app.use('/views', express.static('views'));


app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: __dirname + '/dist'});
});


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
