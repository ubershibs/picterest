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

  MainCtrl.$inject = ['DataService', '$mdToast', '$auth', '$rootScope', '$scope'];
  function MainCtrl(DataService, $mdToast, $auth, $rootScope, $scope) {
    var vm = this;
    vm.pics = [];
    vm.user = null;
    vm.getAllThePics = getAllThePics;
    vm.likedThis = likedThis;
    vm.likeThis = likeThis;
    vm.isAuthenicated = isAuthenticated;
    vm.showToast = showToast;

    (function init() {
      vm.pics = [];
      vm.getAllThePics();
      if (isAuthenticated()) {
        vm.user = $rootScope.currentUser;
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
    }

    function isAuthenticated() {
      return $auth.isAuthenticated();
    }

    function getAllThePics() {
      DataService.getAllThePics()
        .then(function(result) {
          console.log(result.data);
          vm.pics = result.data;
        }, function(error) {
          console.log('err: ' + JSON.stringify(error));
        } );
    }

    function likedThis(pic) {
      if (pic.likers && pic.likers.indexOf(vm.user._id) !== -1) {
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
