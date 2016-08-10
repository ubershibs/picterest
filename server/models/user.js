var findOrCreate = require('mongoose-findorcreate')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');
var moment = require('moment');

//user Schema
var userSchema = new Schema({
  username: String,
  provider: String,
  authID: {type: String, index: true },
  email: { type: String, index: true },
  password: { type: String, select: false },
  accessToken: String
});

userSchema.plugin(findOrCreate);

userSchema.methods.createToken = function() {
  // set expiration to 60 days
  var payload = {
      exp: moment().add(14, 'days').unix(),
      iat: moment().unix(),
      sub: user._id
    };

  return jwt.encode(payload, config.tokenSecret);
};

mongoose.model('User', userSchema);
