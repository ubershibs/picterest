(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name picterestApp.UserService
   * @description A factory for user data retrieval and storage.
   * # user
   * Service in the picterestApp.
   */

  angular
    .module('picterestApp')
    .factory('UserService', UserService);

  UserService.$inject = ['$http'];

  function UserService($http) {
    var service = {
      getUser: getUser
    };

    return service;

    function getUser(userId) {
      return $http.get('http://localhost:3000/api/user/' + userId );
    }
  }
})();
