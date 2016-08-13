var express = require('express');
var router = express.Router();

var BoardHandler = require('../handlers/BoardHandler');
var UserHandler = require('../handlers/UserHandler');

// Auth routes
router.post('/auth/github', UserHandler.githubSignin);
router.post('/auth/twiter', UserHandler.twitterSignin);

// User routes
router.get('/api/user/:id', UserHandler.userInfo);

// Board routes
router.get('/api/pics', BoardHandler.allPics);
router.post('/api/pics', UserHandler.isAuthenticated, BoardHandler.postPic);
router.post('/api/pic/:id/like', UserHandler.isAuthenticated, BoardHandler.likePic);
router.delete('/api/pic/:id/like', UserHandler.isAuthenticated, BoardHandler.unlikePic);
router.get('/api/pic/:id/like', BoardHandler.getLikes);
router.get('/api/pics/:username', BoardHandler.getUserPics);

module.exports = router;
