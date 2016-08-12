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

  DataService.$inject = ['$http'];

  function DataService($http) {
    var service = {
      getAllThePics: getAllThePics,
      getUserPics: getUserPics
    };

    return service;

    function getAllThePics() {
      return $http.get('http://localhost:3000/api/pics');
    }

    function getUserPics(username) {
      return $http.get('http://localhost:3000/api/pics/' + username);
    }
  }
})();
