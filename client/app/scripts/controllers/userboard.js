(function() {
  'use strict';

  /**
   * @ngdoc function
   * @name picterestApp.controller:UserBoardCtrl
   * @description
   * # MainCtrl
   * Controller of the picterestApp
   */
  angular.module('picterestApp')
    .controller('UserBoardCtrl', UserBoardCtrl);

  UserBoardCtrl.$inject = ['DataService', '$mdToast', '$auth', '$rootScope', '$routeParams'];
  function UserBoardCtrl(DataService, $mdToast, $auth, $rootScope, $routeParams) {
    var vm = this;
    vm.pics = [];
    vm.user = null;
    vm.poster = $routeParams.username;
    vm.getUserPics = getUserPics;
    vm.likedThis = likedThis;
    vm.likeThis = likeThis;
    vm.isAuthenicated = isAuthenticated;

    (function init() {
      vm.pics = [];
      vm.getUserPics(vm.poster);
      if (isAuthenticated()) {
        vm.user = $rootScope.currentUser;
      }
    })();

    function isAuthenticated() {
      return $auth.isAuthenticated();
    }

    function getUserPics(poster) {
      DataService.getUserPics(poster)
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
