var express = require('express');
var router = express.Router();

var BoardHandler = require('../handlers/BoardHandler');
var UserHandler = require('../handlers/UserHandler');
// var passportTwitter = require('../handlers/passport.twitter.js');

// Auth routes
router.post('/auth/github', UserHandler.githubSignin);
router.post('/auth/twitter', UserHandler.twitterSignin);
router.get('/auth/twitter', UserHandler.twitterSignin);

// Board routes
router.get('/api/pics', BoardHandler.allPics);
router.post('/api/pics', UserHandler.isAuthenticated, BoardHandler.postPic);
router.post('/api/pic/:id', UserHandler.isAuthenticated, BoardHandler.repostPic);
router.post('/api/pic/:id/like', UserHandler.isAuthenticated, BoardHandler.likePic);
router.delete('/api/pic/:id/like', UserHandler.isAuthenticated, BoardHandler.unlikePic);
router.get('/api/pics/:username', BoardHandler.getUserPics);
router.delete('/api/pic/:id', UserHandler.isAuthenticated, BoardHandler.deletePic);

module.exports = router;
