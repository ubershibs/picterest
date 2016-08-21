(function() {
  'use strict';
  angular
    .module('picterestApp')
    .controller('NavigationCtrl', NavigationCtrl);

  NavigationCtrl.$inject = ['$auth', '$window', '$rootScope', '$mdPanel', '$location'];

  function NavigationCtrl($auth, $window, $rootScope, $mdPanel, $location) {
    var vm = this;
    vm.authenticate = authenticate;
    vm.user = null;
    vm.isAuthenticated = $auth.isAuthenticated();
    vm.logout = logout;
    vm.addPicModal = addPicModal;
    vm._mdPanel = $mdPanel;
    vm.disableParentScroll = false;
    vm.title = title;

    (function init() {
      if (vm.isAuthenticated) {
        vm.user = JSON.parse($window.localStorage.currentUser);
      }
    })();

    function authenticate(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          $window.localStorage.currentUser = JSON.stringify(response.data.user);
          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          vm.user = $rootScope.currentUser;
          vm.isAuthenticated = $auth.isAuthenticated();
        });
    }

    function logout() {
      $auth.logout();
      $window.localStorage.removeItem('currentUser');
      $rootScope.currentUser = null;
      vm.isAuthenticated = $auth.isAuthenticated();
    }

    function title() {
      var re = new RegExp('^\/user\/.+$');
      var path = $location.path();
      if (path === '/') {
        return 'Everyone';
      } else if (re.test(path)) {
        var array = path.split('/');
        var name = array[2].substr(2);
        return name;
      }
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

  PanelDialogCtrl.$inject = ['mdPanelRef', 'DataService', '$q'];
  function PanelDialogCtrl(mdPanelRef, DataService, $q) {
    var vm = this;
    vm.imgSrc = '';
    vm._mdPanelRef = mdPanelRef;
    vm.closeDialog = closeDialog;
    vm.savePic = savePic;

    function savePic(image, title) {
      findDimensions(image).then(function(ratio) {
        DataService.savePic(image, title, ratio);
        vm.closeDialog();
      });
    }

    function closeDialog() {
      vm._mdPanelRef.close();
    }

    // Private methods
    function findDimensions(image) {
      return $q(function(resolve, reject) {
        var img = new Image();
        img.src = image;

        img.onload = function() {
          var height = img.naturalHeight;
          var width = img.naturalWidth;
          var ratio = width / height;
          resolve(ratio);
        };
      });
    }
  }
})();
