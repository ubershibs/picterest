(function() {
  'use strict';

  angular.module('picterestApp')
    .controller('LoginCtrl', LoginCtrl);

  LoginCtrl.$inject = ['$scope', '$auth'];
  function LoginCtrl($scope, $auth) {

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider);
    };

  }
})();
