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
  var user = req.user;
  var image = req.body.image;
  var title = req.body.title;
  Pic.findOne({ url: image }).populate('posters').exec(function(err, result) {
    if (result !== null) {
      if (result.posters.indexOf(req.user) !== -1) {
        res.status(403).json({'message': 'You have already posted or reposted this image'});
      } else if (result.posters.indexOf(req.user) === -1) {
        Pic.update({ _id: result._id}, { $push: { "posters": user }}, { new: true }).exec(function(err,result) {
          if (err) { return next(err); }
          res.status(200).json(result);
        });
      }
    } else {
      var pic = new Pic({
        url: image,
        title: title
      });
      pic.posters.push(user);
      pic.save(function() {
        res.status(200).json(pic);
      });
    }
  });
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
