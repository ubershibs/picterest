(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name picterestApp.DataService
   * @description A factory for loading data from the back-end's API, specifically to do with image
   * retrieval and storage.
   * # data
   * Service in the picterestApp.
   */
  angular
    .module('picterestApp')
    .factory('DataService', DataService);

  DataService.$inject = ['$http', '$window', '$auth', '$q'];

  function DataService($http, $window, $auth, $q) {
    var backEnd = 'http://picterest-backend.herokuapp.com';

    var pics = [];
    var statusMessage = null;
    var currentUser = null;
    var service = {
      getAllThePics: getAllThePics,
      getUserPics: getUserPics,
      savePic: savePic,
      repostPic: repostPic,
      getCurrentPics: getCurrentPics,
      getStatusMessage: getStatusMessage,
      clearStatusMessage: clearStatusMessage,
      deleteThis: deleteThis,
      like: like,
      unlike: unlike,
      getUser: getUser
    };
    /* for local testing:
    var pics = [
      {
        _id: '57b8f1a694567d030078d378',
        title: 'Donald Trump looking hot',
        url: 'http://img.wonkette.com/wp-content/uploads/2016/08/nbc-fires-donald-trump-after-he-calls-mexicans-rapists-and-drug-runners.jpg',
        ratio: 1.3333333333333333,
        __v: 0,
        likers: [ '57b8ebabfb913f03003b272a', '57b908c8134a05d391588cca', '57bc135e551eb10300515b6f' ],
        posters: [
          { _id: '57b908c8134a05d391588cca', 'twitterId': '1308641', 'userPrefix': 't-', 'username': 'ubershibs', '__v': 0 },
          { _id: '57b8ebabfb913f03003b272a', 'userPrefix': 'g-', 'username': 'ubershibs', 'githubId': '11529476', '__v': 0 },
          { _id: '57bc135e551eb10300515b6f', 'userPrefix': 'g-', 'username': 'smendoza787', 'githubId': '17697950', '__v': 0 }
        ]
      },
      {
        _id: '57b8fa7894567d030078d37a', 'title': 'Hillary looking fine',
        url: 'http://www.trbimg.com/img-56bbba2f/turbine/ct-hillary-clinton-speeches-0209-jm-20160208-001/650/650x366',
        ratio:1.7759562841530054,
        __v: 0,
        likers: ['57b8ebabfb913f03003b272a', '57d22e813f49d203008f7bfc'],
        posters: [
          { _id: '57b908c8134a05d391588cca', 'twitterId': '1308641', 'userPrefix': 't-', 'username': 'ubershibs', '__v': 0 },
          { _id: '57d22e813f49d203008f7bfc', 'userPrefix': 'g-', 'username': 'bobbrady', 'githubId': '9534794', '__v': 0 }
        ]
      }
    ];
    */
    return service;

    function getAllThePics() {
      return $q(function(resolve, reject) {
        $http({
          method: 'GET',
          url: backEnd + '/api/pics'
        })
        .then(function(result) {
          var picArray = setTileSpan(result.data);
          picArray = isLiked(picArray);
          pics = isReposter(picArray);
          resolve(pics);
        }, function(error) {
          reject(error);
        });
      });
    }

    /* For testing locally:
    function getAllThePics() {
      return $q(function(resolve, reject) {
        console.log('Pics:' + JSON.stringify(pics));
        var picArray = setTileSpan(pics);
        picArray = isLiked(picArray);
        pics = isReposter(picArray);
        resolve(pics);
      });
    }
    */
    function getUserPics(comboName) {
      return $q(function(resolve, reject) {
        var prefix = comboName.substr(0, 2);
        var username = comboName.substr(2);
        $http({
          method: 'GET',
          url: backEnd + '/api/pics/' + prefix + '/' + username
        })
        .then(function(result) {
          var picArray = setTileSpan(result.data);
          picArray = isLiked(picArray);
          pics = isReposter(picArray);
          resolve(pics);
        }, function(error) {
          reject(error);
        });
      });
    }

    function savePic(image, title, ratio) {
      var newPic = '';
      var body = {
        image: image,
        title: title,
        ratio: ratio
      };
      $http({
        method: 'POST',
        url: backEnd + '/api/pics',
        data: body
      })
      .then(function(response) {
        currentUser = JSON.parse($window.localStorage.currentUser);
        if (response.data.type === 'dupe') {
          statusMessage = response.data.message;
        } else if (response.data.type === 'repost') {
          statusMessage = response.data.message;
          newPic = ratioMath(response.data.pic);
          if (newPic.likers.indexOf(currentUser._id) !== -1 ) {
            newPic.isLiked = true;
          } else {
            newPic.isLiked = false;
          }
          var index = findIndex(pics, newPic._id);
          pics[index] = newPic;
        } else if (response.data.type === 'new') {
          statusMessage = response.data.message;
          newPic = ratioMath(response.data.pic);
          newPic.isLiked = false;
          newPic.isReposter = false;
          pics.push(newPic);
        }
      });
    }

    function repostPic(pic, user) {
      var body = {
        pic: pic,
        user: user
      };
      return $http({
        method: 'POST',
        url: backEnd + '/api/pic/' + pic._id,
        data: body
      })
      .then(function(response) {
        var newPic = '';
        if (response.data.type === 'dupe') {
          statusMessage = response.data.message;
        } else if (response.data.type === 'repost') {
          statusMessage = response.data.message;
          newPic = ratioMath(response.data.pic);
          var index = findIndex(pics, newPic._id);
          newPic.reposter = true;
          if (newPic.likers.indexOf(user._id) > -1) {
            newPic.liked = true;
          } else {
            newPic.liked = false;
          }
          pics[index] = newPic;
        }
      });
    }

    function getCurrentPics() {
      return pics;
    }

    function getStatusMessage() {
      return statusMessage;
    }

    function clearStatusMessage() {
      statusMessage = null;
    }

    function deleteThis(pic, user) {
      $http({
        method: 'DELETE',
        url: backEnd + '/api/pic/' + pic._id
      })
      .then(function(response) {
        statusMessage = response.data.message;
        var index = findIndex(pics, pic._id);
        pics.splice(index, 1);
      });
    }

    function like(pic, user) {
      return $q(function(resolve, reject) {
        var newPic;
        var body = {
          pic: pic,
          user: user
        };
        $http.post(backEnd + '/api/pic/' + pic._id + '/like', body)
        .then(function(response) {
          statusMessage = response.data.message;
          newPic = ratioMath(response.data.pic);
          newPic.liked = true;
          if ($auth.isAuthenticated() === true) {
            var user = JSON.parse($window.localStorage.currentUser);
            newPic = isReposterLogic(newPic, user);
          } else {
            newPic.reposter = false;
          }
          var index = findIndex(pics, newPic._id);
          pics[index] = newPic;
          resolve(newPic);
        }, function(error) {
          reject(error);
        });
      });
    }

    function unlike(pic, user) {
      return $q(function(resolve, reject) {
        var newPic;
        $http.delete(backEnd + '/api/pic/' + pic._id + '/like')
        .then(function(response) {
          statusMessage = response.data.message;
          newPic = ratioMath(response.data.pic);
          newPic.liked = false;
          if ($auth.isAuthenticated() === true) {
            var user = JSON.parse($window.localStorage.currentUser);
            newPic = isReposterLogic(newPic, user);
          } else {
            newPic.reposter = false;
          }
          var index = findIndex(pics, newPic._id);
          pics[index] = newPic;
          resolve(newPic);
        }, function(error) {
          reject(error);
        });
      });
    }

    function getUser(comboName) {
      return $q(function(resolve, reject) {
        var prefix = comboName.substr(0, 2);
        var username = comboName.substr(2);
        $http.get(backEnd + '/api/user/' + prefix + '/' + username)
        .then(function(response) {
          var user = response.data.user;
          resolve(user);
        }, function(error) {
          reject(error);
        });
      });
    }

    // Private methods
    function findIndex(source, id) {
      for (var i = 0; i < source.length; i++) {
        if (source[i]._id === id) {
          return i;
        }
      }
      throw 'Could not find object with id: ' + id;
    }

    function setTileSpan(array) {
      var newArray = [];
      array.forEach(function(pic) {
        pic = ratioMath(pic);
        newArray.push(pic);
      });
      return newArray;
    }

    function ratioMath(pic) {
      var min = 2;
      if (pic.ratio < 0.8) {
        pic.colSpan = min;
        pic.rowSpan = Math.floor(min / pic.ratio);
      } else if (pic.ratio > 1.2) {
        pic.rowSpan = min;
        pic.colSpan = Math.floor(min * pic.ratio);
      } else {
        pic.rowSpan = min;
        pic.colSpan = min;
      }
      return pic;
    }

    function isLiked(pics) {
      var newArray = [];
      if ($auth.isAuthenticated() === true) {
        var user = JSON.parse($window.localStorage.currentUser);
        pics.forEach(function(pic) {
          if (pic.likers.indexOf(user._id) > -1) {
            pic.liked = true;
          } else {
            pic.liked = false;
          }
          newArray.push(pic);
        });
      } else {
        pics.forEach(function(pic) {
          pic.liked = false;
          newArray.push(pic);
        });
      }
      return newArray;
    }

    function isReposter(pics) {
      var newArray = [];
      if ($auth.isAuthenticated() === true) {
        var user = JSON.parse($window.localStorage.currentUser);
        pics.forEach(function(pic) {
          pic = isReposterLogic(pic, user);
          newArray.push(pic);
        });
      } else {
        pics.forEach(function(pic) {
          pic.reposter = false;
          newArray.push(pic);
        });
      }
      return newArray;
    }

    function isReposterLogic(pic, user) {
      var idArray = [];
      pic.posters.forEach(function(poster) {
        idArray.push(poster._id);
      });
      if (idArray.indexOf(user._id) > 0) {
        pic.reposter = true;
      } else {
        pic.reposter = false;
      }
      return pic;
    }
  }
})();
