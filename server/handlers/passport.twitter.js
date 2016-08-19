var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var config = require('../config');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY || config.twitterConsumerKey,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET || config.twitterClientSecret,
    callbackURL: process.env.TWITTER_CALLBACK || config.twitterCallbackUrl
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function() {
      User.findOne({ twitterId: profile.id }).exec(function(err, user) {
        if (err) { return done(err, null); }
      })
      if (!user) {
        user = new User({
          username: profile.username,
          twitterId: profile.id
        });
        user.save(function(err) {
          if (err) { return done(err, null); }
          return done(null, user)
        })
      } else {
        return done(null, profile);
      }
    });
}));

module.exports = passport;
