'use strict';
var mongoose = require('mongoose');
var Pic = mongoose.model('Pic');
var User = mongoose.model('User');

var service = {
  allPics: allPics,
  postPic: postPic,
  likePic: likePic,
  unlikePic: unlikePic,
  getLikes:  getLikes,
  getUserPics: getUserPics
}

module.exports = service;

//////////////////////////////

function allPics(req, res, next) {
  Pic.find({ posters: { $gt: [] } }).populate('posters likers').exec(function(err, result) {
    if (err) { return next(err); }
    res.status(200).json(result);
  });
};

function postPic(req, res, next) {

};

function likePic(req, res, next) {

};

function unlikePic(req, res, next) {

};

function getLikes(req, res, next) {

};

function getUserPics(req, res, next) {
  Pic.find({ posters: req.params.id }).populate('posters likers').exec(function(err, result) {
    if (err) return next(err); }
    res.status(200).json(result);
  })
}
