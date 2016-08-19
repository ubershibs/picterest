var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//user Schema
var userSchema = new Schema({
  username: String,
  githubId: String,
  twitterId: String,
  email: String,
  accessToken: String
});

mongoose.model('User', userSchema);
