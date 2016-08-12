(function() {
  'use strict';

  /**
   * @ngdoc function
   * @name picterestApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the picterestApp
   */
  angular.module('picterestApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['DataService', '$mdToast', '$auth', '$rootScope'];
  function MainCtrl(DataService, $mdToast, $auth, $rootScope) {
    var vm = this;
    vm.pics = [];
    vm.user = null;
    vm.getAllThePics = getAllThePics;
    vm.likedThis = likedThis;
    vm.likeThis = likeThis;
    vm.isAuthenicated = isAuthenticated;

    (function init() {
      vm.pics = [];
      vm.getAllThePics();
      if (isAuthenticated()) {
        vm.user = $rootScope.currentUser;
      }
    })();

    function isAuthenticated() {
      return $auth.isAuthenticated();
    }

    function getAllThePics() {
      DataService.getAllThePics()
        .then(function(result) {
          vm.pics = result.data;
        }, function(error) {
          console.log(error);
        } );
    }

    function likedThis(pic) {
      if (vm.user && pic.likers.indexOf(vm.user._id) !== -1) {
        return true;
      } else {
        return false;
      }
    }

    function likeThis(pic) {
      DataService.like(pic, vm.user).then(function(user) {
        pic.likers.push(user._id);
      });
    }
  }

})();
