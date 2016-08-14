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
    var pics = [];
    var statusMessage = null;
    var service = {
      getAllThePics: getAllThePics,
      getUserPics: getUserPics,
      savePic: savePic,
      getCurrentPics: getCurrentPics,
      getStatusMessage: getStatusMessage,
      clearStatusMessage: clearStatusMessage,
      deleteThis: deleteThis,
      like: like,
      unlike: unlike
    };

    return service;

    function getAllThePics() {
      return $q(function(resolve, reject) {
        $http.get('http://localhost:3000/api/pics').then(function(result) {
          pics = setTileSpan(result.data);
          resolve(pics);
        }, function(error) {
          reject(error);
        });
      });
    }

    function getUserPics(username) {
      return $q(function(resolve, reject) {
        $http.get('http://localhost:3000/api/pics/' + username).then(function(result) {
          pics = setTileSpan(result.data);
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
      $http.post('http://localhost:3000/api/pics', body).then(function(response) {
        if (response.data.type === 'dupe') {
          statusMessage = response.data.message;
        } else if (response.data.type === 'repost') {
          statusMessage = response.data.message;
          newPic = ratioMath(response.data.pic);
          var index = findIndex(pics, newPic._id);
          pics[index] = newPic;
        } else if (response.data.type === 'new') {
          statusMessage = response.data.message;
          newPic = ratioMath(response.data.pic);
          pics.push(newPic);
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
      $http.delete('http://localhost:3000/api/pic/' + pic._id).then(function(response) {
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
        $http.post('http://localhost:3000/api/pic/' + pic._id + '/like', body)
          .then(function(response) {
            statusMessage = response.data.message;
            newPic = ratioMath(response.data.pic);
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
        var body = {
          pic: pic,
          user: user
        };
        $http.delete('http://localhost:3000/api/pic/' + pic._id + '/like')
          .then(function(response) {
            statusMessage = response.data.message;
            newPic = ratioMath(response.data.pic);
            var index = findIndex(pics, newPic._id);
            pics[index] = newPic;
            resolve(newPic);
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
      throw 'Couldn\'t find object with id: ' + id;
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
  }
})();
