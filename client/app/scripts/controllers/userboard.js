(function() {
  'use strict';

  /**
   * @ngdoc function
   * @name picterestApp.controller:UserBoardCtrl
   * @description
   * # UserBoardCtrl
   * Controller of the picterestApp
   */

  angular.module('picterestApp')
    .controller('UserBoardCtrl', UserBoardCtrl);

  UserBoardCtrl.$inject = ['DataService', '$mdToast', '$auth', '$window', '$scope', '$routeParams'];
  function UserBoardCtrl(DataService, $mdToast, $auth, $window, $scope, $routeParams) {
    var vm = this;
    vm.pics = [];
    vm.user = null;
    vm.poster = $routeParams.username;
    vm.getUserPics = getUserPics;
    vm.likedThis = likedThis;
    vm.likeThis = likeThis;
    vm.isAuthenicated = isAuthenticated;
    vm.showToast = showToast;
    vm.isOwnPage = false;
    vm.deleteThis = deleteThis;

    (function init() {
      vm.pics = [];
      vm.getUserPics(vm.poster);
      if (isAuthenticated()) {
        vm.user = JSON.parse($window.localStorage.currentUser);
      }
      if (vm.user.username === vm.poster) {
        vm.isOwnPage = true;
      }
    })();

    $scope.$watch(function() { return DataService.getCurrentPics(); }, function(newValue, oldValue) {
      if (newValue != null) {
        vm.pics = newValue;
      }
    });

    $scope.$watch(function() { return DataService.getStatusMessage(); }, function(newValue, oldValue) {
      if (newValue != null) {
        vm.showToast(newValue);
      }
    });

    function showToast(message) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .hideDelay(5000)
      );
      DataService.clearStatusMessage();
    }

    function isAuthenticated() {
      return $auth.isAuthenticated();
    }

    function getUserPics(poster) {
      DataService.getUserPics(poster)
        .then(function(result) {
          vm.pics = result;
        }, function(error) {
          console.log(error);
        } );
    }

    function likedThis(pic) {
      if (!vm.isAuthenticated) {
        return false;
      } else {
        if (pic.likers && pic.likers.indexOf(vm.user._id) !== -1) {
          return true;
        } else {
          return false;
        }
      }
    }

    function likeThis(pic) {
      DataService.like(pic, vm.user);
    }

    function deleteThis(pic) {
      DataService.deleteThis(pic, vm.user);
    }
  }

})();
