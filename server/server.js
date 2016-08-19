'use strict';
var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var expressSession = require('express-session');
var config = require('./config');
var passport = require('passport');

require('./models/db');
var routes = require('./routes/index.js');

var app = express();

app.use(logger('dev'));
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:9000");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,accept,authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(compress());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(expressSession({ secret: config.tokenSecret, resave: false, saveUninitialized: true }))  ;
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'client'), { maxAge: 2628000000 }));
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
app.listen(port, process.env.IP || "0.0.0.0", function(){
  console.log("Server listening on " + port);
});

module.exports = app;
