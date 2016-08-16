'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');
var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../config');
var request = require('request');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

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
        if (err) { return next(err); }
        var token = createToken(result);
        res.send({ token: token, user: result });
      });
    });
  });
};

passport.user(new TwitterStrategy({
    consumerKey: req.body.clientId,
    consumerSecret: config.twitterClientSecret,
    callbackURL: config.twitterCallbackUrl
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function() {
      User.findOne({ twitterId: profile.id }).exec(function(err, result) {
        if (err) { return cb(err) }
      })
      return done(null, profile);
    });
  }
});

  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var authenticateUrl = 'https://api.twitter.com/oauth/authenticate';


  console.log("Began Twitter back-end function");
  if (!req.query.oauth_token || !req.query.oauth_verifier) {
    var requestTokenOauth = {
      callback: twitter_callback,
      consumer_key: twitter_key,
      consumer_secret: twitter_secret,
    };
    console.log('No oauth token fund. Preparing request token; ' + JSON.stringify(requestTokenOauth));

    // Step 1. Obtain request token for the authorization popup.
    request.post({url: requestTokenUrl, oauth: requestTokenOauth}, function(err, response, body) {
      var oauthToken = body;
      console.log(oauthToken);

      // Step 2. Redirect to the authorization screen.
      res.redirect(authenticateUrl + '?oauth_token=' + oauthToken.oauth_token);
    });
  } else {
    var accessTokenOauth = {
      consumer_key: twitter_key,
      consumer_secret: twitter_secret,
      token: req.query.oauth_token,
      verifier: req.query.oauth_verifier
    };

    // Step 3. Exchange oauth token and oauth verifier for access token.
    request.post({url: accessTokenUrl, oauth: accessTokenOauth}, function(err, response, profile) {

      var profile = JSON.parse(profile);
      console.log(profile);

      var user = {
        twitterId: profile.id,
        username: profile.screen_name,
        email: profile.email,
        accessToken: access_token
      };

      var query =  { twitterId: user.githubId };

      var options = { upsert: true, new: true };

      // Step 4. Create or update a user account
      User.findOneAndUpdate(query, user, options).exec(function(err, result) {
        var token = createToken(result);
        res.send({ token: token, user: result });
      });
    });
  };
};

function userInfo(req, res, next) {
  var userId = req.params.id;
  User.findOne({ _id: userId }).exec(function(err, result) {
    if (err) { return next(err); }
    res.send({ user: result });
  });
};
