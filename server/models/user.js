var findOrCreate = require('mongoose-findorcreate')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');
var moment = require('moment');

//user Schema
var userSchema = new Schema({
  username: String,
  githubId: {type: String, index: true },
  email: { type: String, index: true },
  password: { type: String, select: false },
  accessToken: String
});

userSchema.plugin(findOrCreate);

mongoose.model('User', userSchema);
