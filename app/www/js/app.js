// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
    'ionic',
    'ngCordova',
    'ionic.service.core',
    'ionic.service.push',
    'starter.controllers',
    'starter.services',
    'pascalprecht.translate'
])
    .directive('menuCloseKeepHistory', ['$ionicHistory', function ($ionicHistory) {
        return {
            restrict: 'AC',
            link: function ($scope, $element) {
                $element.bind('click', function () {
                    var sideMenuCtrl = $element.inheritedData('$ionSideMenusController');
                    if (sideMenuCtrl) {
                        $ionicHistory.nextViewOptions({
                            historyRoot: false,
                            disableAnimate: true,
                            expire: 300
                        });
                        sideMenuCtrl.close();
                    }
                });
            }
        };
    }])
    .config(['$ionicAppProvider', function ($ionicAppProvider) {
        // Identify app
        $ionicAppProvider.identify({
            // The App ID (from apps.ionic.io) for the server
            app_id: 'a2b393a3',
            // The public API key all services will use for this app
            api_key: '48c821030b1c81efd8db99241ac251bc0146915d714b0efb',
            // The GCM project ID (project number) from your Google Developer Console (un-comment if used)
            gcm_id: '268978271150'
        });
    }])
    .config(function ($ionicConfigProvider) {
        $ionicConfigProvider.navBar.alignTitle("center");
    })

    .run(function ($rootScope, $ionicLoading, $ionicPlatform, $cordovaStatusbar) {

        $rootScope.$on('$stateChangeStart', function () {
            $ionicLoading.show({
                template: '<ion-spinner/>'
            });
        });

        $rootScope.$on('$stateChangeSuccess', function () {
            setTimeout(function () {
                $ionicLoading.hide();
            }, 500);
        });

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            // Color the iOS status bar text to white
            if (window.StatusBar) {
                $cordovaStatusbar.overlaysWebView(true);
                $cordovaStatusBar.style(1); //Light
            }


        });

    })
    .config(['$translateProvider', function ($translateProvider) {

        $translateProvider.useStaticFilesLoader({
            files: [{
                prefix: 'translation/locale-',
                suffix: '.json'
            }]
        });
        $translateProvider.uniformLanguageTag('bcp47')
            .preferredLanguage('it');
    }])

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup     an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'TabCtrl'
                /*,
               resolve: {
                    catalogue: function (CatalogueService) {
                        return CatalogueService.all()
                    }
                }*/
            })
            // Each tab has its own nav history stack:
            .state('tab.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab-home.html',
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('tab.profilo', {
                url: '/profilo/:id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab-profilo.html'
                    }
                }
            })
            .state('tab.editProfile', {
                url: '/editProfile',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab-editProfile.html',
                        controller: 'EditCtrl'

                    }
                }
            })
            .state('tab.wishlist', {
                url: '/wishlist',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab-wishlist.html',
                        controller: 'wishlistCtrl'

                    }
                }
            })
            .state('tab.registrazione', {
                url: '/registrazione',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab-registrazione.html',
                        controller: 'RegistrationCtrl'
                    }
                }
            })
            .state('tab.categorie', {
                url: '/categorie/:catOid',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab-categorie.html',
                        controller: 'CatCtrl'
                    }
                }
            })
            .state('tab.faq', {
                url: '/faq',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab-faq.html',
                        controller:'FaqCtrl'
                    }
                }
            })
            .state('tab.product', {
                url: '/product/:catOid/:productCode',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab-product.html',
                        controller: 'ProductCtrl'
                    }
                }
            })
            .state('tab.acquista', {
                url: '/acquista',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab-acquista.html',
                        controller: 'AcquistaCtrl'
                    }
                }
            })
            .state('tab.tuoiAcquisti', {
                url: '/tuoiAcquisti',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab-tuoiAcquisti.html',
                        controller: "tuoiAcquistiCtrl"
                    }
                }
            })

// Ionic Push tab

// if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/home');

    })
;
