var express = require('express');
var router = express.Router();
var path = require('path');
var moment = require('moment');
var jwt = require('jwt-simple');

var config = require('./config');
var BoardHandler = require('../handlers/BoardHandler');
var UserHandler = require('../handlers/UserHandler');

// Auth routes
router.post('/auth/login', UserHandler.localSignin);
router.post('/auth/signup', UserHandler.localSignup);
router.post('/auth/github', UserHandler.githubSignin)

// Board routes
router.get('/api/pics', BoardHandler.getAllThePics);
router.post('/api/pics', isAuthenticated, BoardHandler.postPic);
router.post('/api/pic/:id/like', isAuthenticated, BoardHandler.likePic)

module.exports = router;
