(function() {
  'use strict';
  angular
    .module('picterestApp')
    .controller('NavigationCtrl', NavigationCtrl);

  NavigationCtrl.$inject = ['$auth', '$window', '$rootScope', '$mdPanel'];

  function NavigationCtrl($auth, $window, $rootScope, $mdPanel) {
    var vm = this;
    vm.authenticate = authenticate;
    vm.user = null;
    vm.isAuthenticated = $auth.isAuthenticated();
    vm.logout = logout;
    vm.addPicModal = addPicModal;
    vm._mdPanel = $mdPanel;
    vm.disableParentScroll = false;

    (function init() {
      vm.user = JSON.parse($window.localStorage.currentUser);
    })();

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

    function addPicModal() {
      var position = vm._mdPanel.newPanelPosition()
      .absolute()
      .center();
      var config = {
        attachTo: angular.element(document.body),
        controller: PanelDialogCtrl,
        controllerAs: 'ctrl',
        disableParentScroll: vm.disableParentScroll,
        templateUrl: 'views/add.panel.html',
        hasBackdrop: true,
        panelClass: 'addPicDialog',
        position: position,
        trapFocus: true,
        zIndex: 150,
        clickOutsideToClose: true,
        escapeToClose: true,
        focusOnOpen: true
      };
      vm._mdPanel.open(config);
    }
  }

  function PanelDialogCtrl(mdPanelRef, DataService) {
    var vm = this;
    vm._mdPanelRef = mdPanelRef;
    vm.closeDialog = closeDialog;
    vm.savePic = savePic;

    function savePic(image, title) {
      DataService.savePic(image, title).then(function(result) {
        if (result.message) {
          console.log(result.message);
        }
        closeDialog();
      });
    }

    function closeDialog() {
      vm._mdPanelRef.close();
    }
  }
})();
