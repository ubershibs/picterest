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

  MainCtrl.$inject = ['DataService', '$mdToast', '$scope'];

  function MainCtrl(DataService, $mdToast, $scope) {
    var vm = this;
    vm.pics = [];
    vm.user = null;
    vm.getAllThePics = getAllThePics;
    vm.likedThis = likedThis;
    vm.likeThis = likeThis;

    (function init() {
      vm.pics = [];
      vm.getAllThePics();
    })();

    function getAllThePics() {
      DataService.getAllThePics()
        .then(function(result) {
          vm.pics = result.data;
          console.log($scope.pics);
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
