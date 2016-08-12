var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');
var moment = require('moment');

//user Schema
var userSchema = new Schema({
  username: String,
  githubId: String,
  twitterId: String,
  email: String,
  accessToken: String
});

mongoose.model('User', userSchema);
