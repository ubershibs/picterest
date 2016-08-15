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

  MainCtrl.$inject = ['DataService', '$mdToast', '$auth', '$window', '$scope', '$mdDialog'];
  function MainCtrl(DataService, $mdToast, $auth, $window, $scope, $mdDialog) {
    var vm = this;
    vm.pics = [];
    vm.user = '';
    vm.getAllThePics = getAllThePics;
    vm.likeThis = likeThis;
    vm.isAuthenticated = isAuthenticated;
    vm.showToast = showToast;
    vm.isOwnPage = false;
    vm.unlikeThis = unlikeThis;
    vm.repostThis = repostThis;

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
          console.log(error);
        } );
    }

    function likeThis(pic, event) {
      if (vm.isAuthenticated() === true) {
        DataService.like(pic, vm.user).then(function(newPic) {
          return newPic;
        });
      } else {
        showSignInAlert(event, 'like');
      }
    }

    function unlikeThis(pic, event) {
      if (vm.isAuthenticated() === true) {
        DataService.unlike(pic, vm.user).then(function(newPic) {
          return newPic;
        });
      } else {
        showSignInAlert(event, 'unlike');
      }
    }

    function repostThis(pic, event) {
      if (vm.isAuthenticated() === true) {
        DataService.repostPic(pic, vm.user).then(function(newPic) {
          return newPic;
        });
      } else {
        showSignInAlert(event, 'repost pics');
      }
    }

    // Private methods
    function showSignInAlert(event, ev) {
      var text = 'Only signed-in users can ' +  ev + '.';
      text += 'Use the buttons at the top right of the screen to sign in.';
      $mdDialog.show(
        $mdDialog.alert(event, text)
          .parent(angular.element(document.querySelector('md-content')))
          .clickOutsideToClose(true)
          .title('Please Sign In to Continue')
          .textContent(text)
          .ariaLabel('Sign In Dialog')
          .ok('Got it!')
          .targetEvent(event)
        );
    }
  }

})();
