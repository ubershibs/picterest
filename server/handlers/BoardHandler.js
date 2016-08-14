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
  getUserPics: getUserPics,
  deletePic: deletePic
}

module.exports = service;

//////////////////////////////

function allPics(req, res, next) {
  Pic.find({ posters: { $gt: [] } }).populate('posters').exec(function(err, result) {
    if (err) { return next(err); }
    res.status(200).json(result);
  });
};

function postPic(req, res, next) {
  var user = req.user._id;
  var image = req.body.image;
  var title = req.body.title;
  var ratio = req.body.ratio;

  Pic.findOne({ url: image }).exec(function(err, result) {
    if (err) { return next(err); }
    // Find out if user has already posted this image
    if (result === null) {
      var pic = new Pic({
        title: title,
        url: image,
        ratio: ratio
      });
      pic.posters.push(user);
      pic.save(function() {
        res.status(200).json({ pic: pic, message: 'Pic posted successfully!', type: 'new' });
      });
    } else if (result.posters && result.posters.indexOf(user) > -1) {
      res.json({ pic: null, message: 'You have already posted this image.', type: 'dupe' });
    } else if (result.posters && result.posters.indexOf(user) === -1){
      Pic.findOneAndUpdate({ _id: result._id },{ $push: { posters: user }},{ new: true }).exec(function(err, result) {
        if (err) { return next(err); }
        res.status(200).json({ pic: result, message: 'Pic reposted successfully.', type: 'repost'});
      })
    }
  });
};

function likePic(req, res, next) {
  var user = req.user;
  var pic = req.body.pic;
  Pic.findOneAndUpdate({ _id: pic._id }, { $push: { likers: user._id }}, { new: true })
    .exec(function(err, result) {
      if (err) { return next(err); }
      res.status(200).json({ pic: result, message: 'Pic liked successfully!', type: 'like' })
    })
};

function unlikePic(req, res, next) {
  var user = req.user;
  var pic = req.body.pic;
  Pic.findOneAndUpdate({ _id: pic._id }, { $pull: { likers: user._id }}, { new: true })
    .exec(function(err, result) {
      if (err) { return next(err); }
      res.status(200).json({ pic: result, message: 'You have un-liked that pic!', type: 'unlike' })
    })
};

function getLikes(req, res, next) {

};

function getUserPics(req, res, next) {
  User.findOne({ username: req.params.username }).exec(function(err, result) {
    var uid = result._id;
    Pic.find({ posters: uid }).exec(function(err, result) {
      if (err) { return next(err); }
      res.status(200).json(result);
    })
  })
}

function deletePic(req, res, next) {
  Pic.findOneAndUpdate({ _id: req.params.id }, { $pull: { posters: req.user._id }}, { new: true }).exec(function(err, result) {
    if (err) { return next(err); }
    res.status(200).json({ pic: result, message: 'Pic deleted from your account',  type: 'delete' });
  });
}
