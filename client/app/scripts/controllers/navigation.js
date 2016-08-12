(function() {
  'use strict';
  angular
    .module('picterestApp')
    .controller('NavigationCtrl', NavigationCtrl);

  NavigationCtrl.$inject = ['$auth', '$window', '$rootScope'];

  function NavigationCtrl($auth, $window, $rootScope) {
    var vm = this;
    vm.authenticate = authenticate;
    vm.user = null;
    vm.isAuthenticated = $auth.isAuthenticated();
    vm.logout = logout;

    function authenticate(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          console.log(response);
          $window.localStorage.currentUser = JSON.stringify(response.data.user);
          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          vm.user = $rootScope.currentUser;
          vm.isAuthenticated = $auth.isAuthenticated();
        });
    }

    function logout() {
      $auth.logout();
    }
  }
})();
