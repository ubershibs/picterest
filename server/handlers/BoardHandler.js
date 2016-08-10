'use strict';
var mongoose = require('mongoose');
var Pic = mongoose.model('Pic');
var User = mongoose.model('User');

module.exports.allPics = function(req, res, next) {
  Pic.find({ posters: { $gt: [] } }).populate('posters likers').exec(function(err, result) {
    if (err) { return next(err); }
    res.status(200).json(result);
  });
};
