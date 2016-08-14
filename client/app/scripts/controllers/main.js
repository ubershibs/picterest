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

  MainCtrl.$inject = ['DataService', '$mdToast', '$auth', '$window', '$scope'];
  function MainCtrl(DataService, $mdToast, $auth, $window, $scope) {
    var vm = this;
    vm.pics = [];
    vm.user = null;
    vm.title = 'All Users\' Pics';
    vm.getAllThePics = getAllThePics;
    vm.likedThis = likedThis;
    vm.likeThis = likeThis;
    vm.isAuthenicated = isAuthenticated;
    vm.showToast = showToast;
    vm.isOwnPage = false;
    vm.unlikeThis = unlikeThis;

    (function init() {
      vm.pics = [];
      vm.getAllThePics();
      if (isAuthenticated()) {
        vm.user = JSON.parse($window.localStorage.currentUser);
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

    function getAllThePics() {
      DataService.getAllThePics()
        .then(function(result) {
          vm.pics = result;
        }, function(error) {
        } );
    }

    function likedThis(pic) {
      if (vm.user) {
        if (pic.likers && pic.likers.indexOf(vm.user._id) > -1) {
          return true;
        } else {
          return false;
        }
      }
    }

    function likeThis(pic) {
      DataService.like(pic, vm.user).then(function(newPic) {
        vm.likedThis(newPic);
      });
    }

    function unlikeThis(pic) {
      DataService.unlike(pic, vm.user).then(function(newPic) {
        vm.likedThis(newPic);
      });
    }
  }

})();
