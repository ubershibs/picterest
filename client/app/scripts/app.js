(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @name picterestApp
   * @description A pinterest clone built by Luke Walker for Free Code Camp's Back-End Web Development Certifications
   * # picterestApp
   *
   * Main module of the application.
   */
  angular
    .module('picterestApp', [
      'ngAnimate',
      'ngRoute',
      'ngSanitize',
      'ngMaterial',
      'satellizer'
    ])
    .config(appConfig)
    .run(runFn);
    appConfig.$inject = ['$routeProvider', '$authProvider', '$mdThemingProvider', '$locationProvider'];

  function appConfig($routeProvider, $authProvider, $mdThemingProvider, $locationProvider) {

    var backEnd = 'http://picterest-backend.herokuapp.com';

    $mdThemingProvider.theme('default')
      .primaryPalette('grey')
      .accentPalette('cyan')
      .warnPalette('red')
      .dark();

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'vm'
      })
      .when('/user/:username', {
        templateUrl: 'views/main.html',
        controller: 'UserBoardCtrl',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
    $authProvider.github({
      clientId: '8eeaab0ee8e8495d69f6',
      redirectUri: 'http://ubershibs-picterest.herokuapp.com',
      url: backEnd + '/auth/github'
    });

    $authProvider.twitter({
      url: backEnd + '/auth/twitter',
      redirectUri: 'http://ubershibs-picterest.herokuapp.com'
    });

  }

  runFn.$inject = ['$rootScope', '$window', '$auth'];
  function runFn($rootScope, $window, $auth) {
    if ($auth.isAuthenticated()) {

      var payload = $auth.getPayload();
      $rootScope.currentUser = payload.sub;

    }
  }

})();
