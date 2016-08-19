'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');
var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../config');
var request = require('request');
var passport = require('./passport.twitter.js');
var qs = require('querystring');
//var BearerStrategy = require('passport-http-bearer').Strategy;
require('request-debug')(request);

var serveStatic = require('serve-static');

var service = {
  isAuthenticated: isAuthenticated,
  createToken: createToken,
  githubSignin: githubSignin,
  twitterSignin: twitterSignin,
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

function twitterSignin(req, res, next) {

  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var authenticateUrl = 'https://api.twitter.com/oauth/authenticate';
  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

  var callback = 'http://127.0.0.1:3000/auth/twitter';
  var consumer_key= config.twitterConsumerKey;
  var consumer_secret = config.twitterClientSecret;

  // Part 1 of 2: Initial request from Satellizer.
  if (!req.body.oauth_token || !req.body.oauth_verifier) {
    var requestTokenOauth = {
      callback: 'http://127.0.0.1:3000/auth/twitter',
      consumer_key: config.twitterConsumerKey,
      consumer_secret: config.twitterClientSecret
    };

    // Step 1. Obtain request token for the authorization popup.
    request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
      var oauthToken = qs.parse(body);

      // Step 2. Send OAuth token back to open the authorization screen.
      res.send(oauthToken);
    });
  } else {
    var accessTokenOauth = {
      consumer_key: consumer_key,
      consumer_secret: consumer_secret,
      token: req.query.oauth_token,
      verifier: req.query.oauth_verifier
    };

    // Step 3. Exchange oauth token and oauth verifier for access token.
    request.post({url: accessTokenUrl, oauth: accessTokenOauth}, function(err, response, accessToken) {

      accessToken = qs.parse(accessToken);

      var profileOauth = {
        consumer_key: consumer_key,
        consumer_secret: consumer_secret,
        oauth_token: accessToken.oauth_token
      };

      request.get({
        url: profileUrl + accessToken.screen_name,
        oauth: profileOauth,
        json: true
      }, function(err ,response, profile) {

      if (req.header('Authorization')) {
        User.findOne({ twitterId: profile.id }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
          }

          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);

          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }

            user.twitterId = profile.id;
            user.userame = profile.screen_name;
            user.save(function(err) {
              res.send({ token: createJWT(user) });
            });
          });
        });
      } else {
        var user = {
          twitterId: profile.id,
          username: profile.screen_name,
          accessToken: access_token
        };

        var query =  { twitterId: user.githubId };

        var options = { upsert: true, new: true };

        // Step 4. Create or update a user account
        User.findOneAndUpdate(query, user, options).exec(function(err, result) {
          var token = createToken(result);
          res.send({ token: token, user: result });
        });
      }
    });
  });
}
}

/*
      var uri = authenticateUrl + '?' + qs.stringify({ oauth_token: oauthToken })
      var auth_data = qs.parse(body);
      var oauth = {
        consumer_key: consumer_key,
        consumer_secret: consumer_secret,
        token: auth_data.oauth_token,
        token_secret: req_data.oauth_token_secret,
        verifier: auth_data.oauth_verifier
      };

      request.post({ url: accessTokenUrl, oauth: oauth}, function (err, response, body) {
        var perm_data = qs.parse(body);
        var oauth = {
          consumer_key: consumer_key,
          consumer_secret: consumer_secret,
          token: perm_data.oauth_token,
          token_secret: perm_data.oauth_token_secret
        };
        var url = 'https://api.twitter.com/1.1/users/show.json';
        var qs = {
          screen_name: perm_data.screen_name,
          user_id: perm_data.user_id
        };

        request.get({ url: url, oauth: oauth, qs: qs, json: true }, function(err, response, body) {
          console.log(user);
        });
      });
    });
  }
};

/*
    });
  } else {
    if(!req.session['oauth:twitter']) {
      req.session['oauth:twitter'] = {};
    }

    req.query.oauth_token = req.body.oauth_token;
    req.query.oauth_verifier = req.body.oauth_verifier;

    passport.authenticate('twitter',
    function(err, user) {
      res.send({ token: 'someToken', username: user.username });
    })(req, res, next);
  }
};

/*
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


function userInfo(req, res, next) {
  var userId = req.params.id;
  User.findOne({ _id: userId }).exec(function(err, result) {
    if (err) { return next(err); }
    res.send({ user: result });
  });
};
*/
