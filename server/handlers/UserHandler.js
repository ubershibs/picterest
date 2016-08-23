'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');
var moment = require('moment');
var jwt = require('jwt-simple');
var request = require('request');
var qs = require('querystring');

var tokenSecret = process.env.TOKEN_SECRET;
var githubSecret = process.env.GITHUB_SECRET;
var twitterKey = process.env.TWITTER_KEY;
var twitterSecret = process.env.TWITTER_SECRET;
var frontEndUri = process.env.FRONT_END_URI;
var service = {
  isAuthenticated: isAuthenticated,
  createToken: createToken,
  githubSignin: githubSignin,
  twitterSignin: twitterSignin,
  getUserInfo: getUserInfo
}

module.exports = service;

//////////////////////

function getUserInfo(req, res, next) {
  User.findOne({ userPrefix: req.params.prefix, username: req.params.username }).exec(function(err, result) {
    if (err) { return next(err); }
    return res.status(200).json({ user: result });
  })
}

// Determines whether or not a user is authenticated
function isAuthenticated(req, res, next) {
	if (!(req.headers && req.headers.authorization)) {
		return res.status(400).send({ message: 'You did not provide a JSON Web Token in the Authorization header.' });
	}

	var header = req.headers.authorization.split(' ');
	var token = header[1];
	var payload = jwt.decode(token, tokenSecret);
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

  return jwt.encode(payload, tokenSecret);
}

// Signs a user in via Github and creates or returns an account
function githubSignin(req, res, next) {
  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var userApiUrl = 'https://api.github.com/user';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: githubSecret,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params }, function(err, response, accessToken) {
    accessToken = qs.parse(accessToken);
    var headers = { 'User-Agent': 'Ubershibs Picterest' };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {

      // Step 3a. Link user accounts.
      if (req.header('Authorization')) {
        User.findOne({ githubId: profile.id }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, tokenSecret);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.githubId = profile.id;
            user.username = profile.login;
            user.userPrefix = 'g-'
            user.save(function() {
              var token = createToken(user);
              res.send({ token: token, user: user });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ githubId: profile.id }, function(err, existingUser) {
          if (existingUser) {
            var token = createToken(existingUser);
            return res.send({ token: token, user: existingUser });
          }
          var user = new User();
          user.githubId = profile.id;
          user.username = profile.login;
          user.userPrefix = 'g-'
          user.save(function() {
            var token = createToken(user);
            res.send({ token: token, user: user });
          });
        });
      }
    });
  });
};

function twitterSignin(req, res, next) {

  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
  var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

     // Part 1 of 2: Initial request from Satellizer.
     if (!req.body.oauth_token || !req.body.oauth_verifier) {
       var requestTokenOauth = {
         callback: frontEndUri,
         consumer_key: process.env.TWITTER_KEY ,
         consumer_secret: process.env.TWITTER_SECRET
       };

       // Step 1. Obtain request token for the authorization popup.
       request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
         var oauthToken = qs.parse(body);

         // Step 2. Send OAuth token back to open the authorization screen.
         res.send(oauthToken);
       });

     } else {

       var accessTokenOauth = {
         consumer_key: process.env.TWITTER_KEY ,
         consumer_secret: process.env.TWITTER_SECRET,
         token: req.body.oauth_token,
         verifier: req.body.oauth_verifier
       };

       // Step 3. Exchange oauth token and oauth verifier for access token.
       request.post({url: accessTokenUrl, oauth: accessTokenOauth}, function(err, response, accessToken) {

         accessToken = qs.parse(accessToken);

         var profileOauth = {
           consumer_key: process.env.TWITTER_KEY,
           consumer_secret: process.env.TWITTER_SECRET,
           oauth_token: accessToken.oauth_token
         };
         console.log(JSON.stringify(accessToken));

         request.get({
           url: profileUrl + accessToken.screen_name,
           oauth: profileOauth,
           json: true
         }, function(err ,response, profile) {

         if (req.header('Authorization')) {
           User.findOne({ twitterId: profile.id }, function(err, existingUser) {
             if (existingUser) {
               console.log(JSON.stringify(existingUser))
               return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
             }

             var token = req.header('Authorization').split(' ')[1];
             var payload = jwt.decode(token, process.env.TOKEN_SECRET);

             User.findById(payload.sub, function(err, user) {
               if (!user) {
                 return res.status(400).send({ message: 'User not found' });
               }

               user.twitterId = profile.id;
               user.userame = profile.screen_name;
               user.userPrefix = 't-'
               user.save(function(err) {
                 res.send({ token: createToken(user), user: user });
               });
             });
           });
         } else {
           console.log(profile);
           var user = {
             twitterId: profile.id,
             username: profile.screen_name,
             userPrefix: 't-'
           };

           var query =  { twitterId: user.twitterId };

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
