var mongoose = require('mongoose');
var User = mongoose.model('User');
var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../config');
var request = require('request');

var service = {
  isAuthenticated: isAuthenticated,
  createToken: createToken,
  githubSignin: githubSignin,
  twitterSignin: twitterSignin,
  userInfo: userInfo
}

module.exports = service;

//////////////////////

// Determines whether or not a user is authenticated
function isAuthenticated(req, res, next) {
	if (!(req.headers && req.headers.authorization)) {
		return res.status(400).send({ message: 'You did not provide a JSON Web Token in the Authorization header.' });
	}

	var header = req.headers.authorization.split(' ');
	var token = header[1];
	var payload = jwt.decode(token, config.tokenSecret);
	var now = moment().unix();

	if (now > payload.exp) {
		return res.status(401).send({ message: 'Token has expired.' });
	}

	User.findById(payload.sub, function(err, user) {
		if (!user) {
			return res.status(400).send({ message: 'User no longer exists.' });
		}

		req.user = user;
		next();
	})
}

// Creates a token to be stored via Satellizer
function createToken(user) {
  var payload = {
    exp: moment().add(14, 'days').unix(),
    iat: moment().unix(),
    sub: user._id
  };

  return jwt.encode(payload, config.tokenSecret);
}

// Signs a user in via Github and creates or returns an account
function githubSignin(req, res, next) {
  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var userProfileUrl = 'https://api.github.com/user';

  var params = {
    client_id: req.body.clientId,
    redirect_uri: req.body.redirectUri,
    client_secret: config.githubClientSecret,
    code: req.body.code,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post({ url: accessTokenUrl, form: params, json: true }, function(error, response, body) {
    var access_token = body.access_token;
    request.get({ url: userProfileUrl + '?access_token=' + access_token, headers: { 'User-Agent': 'ubershibs picterest' }}, function(error, response, getBody) {
      var parsedBody = JSON.parse(getBody);

      var user = {
        githubId: parsedBody.id,
        username: parsedBody.login,
        email: parsedBody.email,
        accessToken: access_token
      };

      var query =  { githubId: user.githubId };

      var options = { upsert: true, new: true };

      User.findOneAndUpdate(query, user, options).exec(function(err, result) {
        var token = createToken(result);
        res.send({ token: token, user: result });
      });
    });
  });
};

function twitterSignin(req, res, next) {
  var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';

  var params = {
    client_id: req.body.clientId,
    redirect_uri: req.body.redirectUri,
    client_secret: config.twitterClientSecret,
    code: req.body.code,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post({ url: accessTokenUrl, form: params, json: true }, function(error, response, body) {
    console.log(JSON.stringify(body));
    var access_token = body.access_token;

    request.get({ url: userProfileUrl + '?access_token=' + access_token, headers: { 'User-Agent': 'ubershibs picterest' }}, function(error, response, body) {

      // Step 2b. Create a new user account or return an existing one.
      User.findOne({ twitterId: body.id }, function(err, existingUser) {
        if (existingUser) {

          var token = createToken(existingUser);
          res.send({ token: token, user: existingUser });

        } else {

          var user = new User({
            githubId: body.id,
            username: body.login,
            accessToken: access_token
          });

          user.save(function() {
            var token = createToken(user);
            res.send({ token: token, user: user });
          });
        }
      });
    });
  });
};

function userInfo(req, res, next) {
  var userId = req.params.id;
  User.findOne({ _id: userId }).exec(function(err, result) {
    if (err) { return next(err); }
    res.send({ user: result });
  });
};
