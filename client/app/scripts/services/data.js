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
      getStatusMessage: getStatusMessage
    };

    return service;

    function getAllThePics() {
      return $q(function(resolve, reject) {
        $http.get('http://localhost:3000/api/pics').then(function(result) {
          pics = result.data;
          resolve(pics);
        }, function(error) {
          reject(error);
        });
      });
    }

    function getUserPics(username) {
      return $q(function(resolve, reject) {
        $http.get('http://localhost:3000/api/pics/' + username).then(function(result) {
          pics = result.data;
          resolve(pics);
        }, function(error) {
          reject(error);
        });
      });
    }

    function savePic(image, title) {
      var user = $window.localStorage.currentUser;
      var body = {
        image: image,
        title: title,
        user: user
      };
      $http.post('http://localhost:3000/api/pics', body).then(function(result) {
        console.log(result);
        if (result.data.message) {
          statusMessage = 'You cannot post the same image twice';
          return statusMessage;
        } else {
          if (pics.indexOf(result.data._id) === -1) {
            pics.push(result.data);
            statusMessage = 'Image reposted';
            return pics;
          } else {
            statusMessage = 'Image reposted';
            return statusMessage;
          }
        }
      });
    }

    function getCurrentPics() {
      return pics;
    }

    function getStatusMessage() {
      return statusMessage;
    }
  }
})();
