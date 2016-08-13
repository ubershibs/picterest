'use strict';
var mongoose = require('mongoose');
var Pic = mongoose.model('Pic');
var User = mongoose.model('User');
var ObjectId = mongoose.Types.ObjectId;

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
  var user = req.body.user;
  var url = req.body.url;
  var title = req.body.title;

  Pic.find({ url: url }).exec(function(err, result) {
    if (result) {
      Pic.findOneAndUpdate({ _id: result._id }, { $push: { "posters": user}}).exec(function(err, resut) {
        if (err) { return next(err); }
        res.status(200).json({'message': 'Image already exists in our DB. You have been added as a poster, but your title has been discarded.'});
      });
    } else {
      var pic = new Pic({
        url: url,
        title: title,
        posters: [user]
      });
      pic.save(function(err, result) {
        if (err) { return next(err); }
        res.status(200).json(result);
      })
    }
  })
};

function likePic(req, res, next) {

};

function unlikePic(req, res, next) {

};

function getLikes(req, res, next) {

};

function getUserPics(req, res, next) {
  User.findOne({ username: req.params.username }).exec(function(err, result) {
    var uid = result._id;
    console.log(uid);
    Pic.find({ posters: uid }).exec(function(err, result) {
      console.log(JSON.stringify(result));
      if (err) { return next(err); }
      console.log("Sending " + result.length + " pics");
      res.status(200).json(result);
    })
  })
}
