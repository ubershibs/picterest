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

  DataService.$inject = ['$http', '$rootScope'];

  function DataService($http, $rootScope) {
    var service = {
      getAllThePics: getAllThePics,
      getUserPics: getUserPics,
      savePic: savePic
    };

    return service;

    function getAllThePics() {
      return $http.get('http://localhost:3000/api/pics');
    }

    function getUserPics(username) {
      return $http.get('http://localhost:3000/api/pics/' + username);
    }

    function savePic(image, title) {
      var user = $rootScope.currentUser._id;
      var body = {
        image: image,
        title: title,
        user: user
      };
      return $http.post('http://localhost:3000/api/pics', body);
    }
  }
})();
