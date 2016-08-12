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
      'ngResource',
      'ngRoute',
      'ngSanitize',
      'ngMaterial',
      'satellizer'
    ])
    .config(appConfig)
    .run(runFn);
    appConfig.$inject = ['$routeProvider', '$authProvider', '$mdThemingProvider', '$locationProvider'];

  function appConfig($routeProvider, $authProvider, $mdThemingProvider, $locationProvider) {
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
        controller: 'UserBoartCtrl',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
    $authProvider.github({
      clientId: '8eeaab0ee8e8495d69f6',
      redirectUri: 'http://localhost:9000/',
      url: 'http://localhost:3000/auth/github'
    });

    $authProvider.twitter({
      url: 'http://localhost:3000/auth/twitter',
      clientId: 'RnYWR4G2LtQd5frxR9iymU4CR',
      redirectUri: 'http://localhost:9000/',
      responseType: 'token'
    });

    $authProvider.httpInterceptor = true;
  }

  runFn.$inject = ['$rootScope', '$window', '$auth'];
  function runFn($rootScope, $window, $auth) {
    if ($auth.isAuthenticated()) {

      var payload = $auth.getPayload();
      $rootScope.currentUser = payload.sub;

    }
  }

})();
