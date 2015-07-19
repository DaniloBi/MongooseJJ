angular.module('starter.controllers', [])

    .controller('HomeCtrl', function (UserService, $rootScope,$scope) {
        if (UserService.getCurrentUser().email == undefined)
            console.log("Vuoto");
        else {
            $rootScope.user = UserService.getCurrentUser();
            $scope.doLogin();
        }
    })
    .controller('wishlistCtrl', function (StorageService, $scope) {
        $scope.wishlist = StorageService.getWishList();
        console.log($scope.wishlist);

        $scope.removeFromWishList = function (item) {
            StorageService.removeWishlist(item);
        }
    })
    .controller('ProductCtrl', function ($state, $scope, $stateParams, filterFilter, $rootScope, StorageService, $ionicPopup, $translate) {
        $rootScope.product = {};
        $scope.cat = filterFilter($scope.catalogo, {code: $stateParams.catOid})[0];
        $rootScope.element = filterFilter($scope.cat.Products, {oid: $stateParams.productCode})[0];

        $rootScope.product['price'] = $rootScope.element.price;
        $rootScope.product['product'] = $rootScope.element.originalOid;
// Per il <select>
        $scope.mapTaglia = $rootScope.element.Taglia;
        $scope.mapColore = $rootScope.element.Colore;


        $scope.redirect = function () {
            $state.go('tab.acquista');
            console.log($rootScope.user.taglia);
        };
        $scope.showConfirmWishlist = function (product) {
            $translate('WISHLIST_ALERT_TITLE').then(function (result) {
                $scope.wishlistTitle = result;

                $translate('WISHLIST_ALERT_MESSAGE').then(function (result) {
                    $scope.wishlistMessage = result;
                    var confirmPopup = $ionicPopup.confirm({
                        title: $scope.wishlistTitle,
                        template: $scope.wishlistMessage
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            $scope.addWishlist(product);
                            console.log('Added to wishlist');
                        } else {
                            console.log('Not added');
                        }
                    });
                });
            });


        };
        $scope.addWishlist = function (product) {
            //if (!StorageService.getWishList().contains(product))

            if (StorageService.getWishList().indexOf(product) == -1)
                StorageService.setWishList(product);
            console.log("Wishlist: " + StorageService.getWishList());
            //console.log(StorageService.getWishList().Contains(product));


        }


    })
    .controller('AcquistaCtrl', function ($scope, $rootScope, ServerServices, $translate) {

        console.log(JSON.stringify($rootScope.user));
        $scope.startPayment = function () {
            $rootScope.user.size = $rootScope.product.taglia;
            $rootScope.user.color = $rootScope.product.colore;
            $rootScope.user.product = $rootScope.product.product;
            $rootScope.user.price = $rootScope.product.price;

            ServerServices.orderCreation($rootScope.user)
                .success(function (response) {

                    console.log("Vittoria:" + response);
                    console.log(response[0].oid);
                    $scope.oidOrder = response[0].oid;
                    app.initPaymentUI();

                })
                .error(function (response) {
                    console.log(response);
                })

        }

        //PAYPAL
        var app = {
            // Application Constructor

            // deviceready Event Handler
            //
            // The scope of 'this' is the event. In order to call the 'receivedEvent'
            // function, we must explicity call 'app.receivedEvent(...);'


            initPaymentUI: function () {
                var clientIDs = {
                    "PayPalEnvironmentProduction": "YOUR_PRODUCTION_CLIENT_ID",
                    "PayPalEnvironmentSandbox": "AbXCfbqg397E8sn53Rxq6gPuoq1ti7PuO_doxuSlp2Kk6bugS-MfwZmME5lqOwUU7iAScfJg7OJU9w6W"
                };
                PayPalMobile.init(clientIDs, app.onPayPalMobileInit);

            },
            onSuccesfulPayment: function (payment) {
                $scope.invioDatiPagamento = {};
                console.log("payment success: " + JSON.stringify(payment, null, 4));
                console.log("ID PAGAMENTO: " + payment.response.id);
                $scope.invioDatiPagamento['email'] = $rootScope.user.email;
                $scope.invioDatiPagamento['password'] = $rootScope.user.password;
                $scope.invioDatiPagamento['order'] = $scope.oidOrder;
                $scope.invioDatiPagamento['transactionId'] = payment.response.id;
                ServerServices.orderConfermation($scope.invioDatiPagamento)
                    .success(function (response) {
                        $translate('PAYMENT_OUTCOME_SUCCESSFULL').then(function (result) {
                            $scope.showAlert('', result);
                        });
                    })
                    .error(function (response) {
                        $translate('PAYMENTO_OUTCOME_FAILED').then(function (result) {
                            $scope.showAlert('', result);
                        });
                    })
            },

            createPayment: function () {
                // for simplicity use predefined amount
                var paymentDetails = new PayPalPaymentDetails($rootScope.user.price, "0.00", "0.00");
                var payment = new PayPalPayment($rootScope.user.price, "EUR", $rootScope.element.descriptionShort, "Sale",
                    paymentDetails);
                return payment;
            },
            configuration: function () {
                // for more options see `paypal-mobile-js-helper.js`
                var config = new PayPalConfiguration({
                    merchantName: "JonnyJoy",
                    merchantPrivacyPolicyURL: "https://mytestshop.com/policy",
                    merchantUserAgreementURL: "https://mytestshop.com/agreement"
                });
                return config;
            },
            onPrepareRender: function () {
                // buttons defined in index.html
                //  <button id="buyNowBtn"> Buy Now !</button>
                //  <button id="buyInFutureBtn"> Pay in Future !</button>
                //  <button id="profileSharingBtn"> ProfileSharing !</button>


                buyNowBtn = function (e) {
                    // single payment
                    PayPalMobile.renderSinglePaymentUI(app.createPayment(), app.onSuccesfulPayment,
                        app.onUserCanceled);
                };
                buyNowBtn();

            },
            onPayPalMobileInit: function () {
                // must be called
                // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
                PayPalMobile.prepareToRender("PayPalEnvironmentNoNetwork", app.configuration(),
                    app.onPrepareRender);
            },
            onUserCanceled: function (result) {
                $translate('PAYMENTO_OUTCOME_FAILED').then(function (result) {
                    $scope.showAlert('', result);
                });
                console.log(result);
            }
        };


    })


    .controller('CatCtrl', function ($scope, $stateParams, filterFilter) {

        console.log(filterFilter($scope.catalogo, {code: $stateParams.catOid})[0]);
        $scope.categoria = filterFilter($scope.catalogo, {code: $stateParams.catOid})[0];

    })
    .controller('FaqCtrl',function(ServerServices,$scope){
        $scope.faqList={};
        ServerServices.faqListRequest().then(function(response){
            $scope.faqList=response;
            console.log($scope.faqList);
        })
    })
    .controller("tuoiAcquistiCtrl", function (ServerServices, $rootScope, $scope, $state,$translate) {

        if (!$rootScope.connected) {
            $translate('LOGIN_REQUIRED').then(function (result) {
                $scope.showAlert('', result);
            });
            $state.go('tab.home');

        }
        else {
            $scope.lista = {};
            ServerServices.orderList($rootScope.user)
                .success(function (response) {
                    console.log(response);
                    $scope.lista = response;
                })
                .error(function (response) {
                    console.log(response);
                })
            }
    })
    /* .controller('LoginCtrlOld', function ($scope, $log, $state, $cordovaOauth, PersistenceService, SocialLogin) {
     PersistenceService.getSocialLogin().then(function (data) {
     $scope.socialLogin = data;
     if ($scope.socialLogin == undefined) {
     $scope.socialLogin = {};
     }
     });

     $scope.facebook = function () {
     $log.debug("Facebook Login");
     function newLogin() {
     $cordovaOauth.facebook("731793956936966", ["public_profile", "email"]).then(function (result) {
     $log.debug("Facebook OAUTH call: ", result);
     $scope.socialLogin.fbOauth = result;
     PersistenceService.setSocialLogin($scope.socialLogin);
     SocialLogin.fbUserData(result.access_token).get(
     function (data) {
     $scope.userData = data;
     PersistenceService.setCurrentUserFromFb(data);
     $state.go('app.home');
     });
     }, function (error) {
     $log.error("Facebook OAUT Error: ", error);
     });
     }

     if (!$scope.socialLogin.hasOwnProperty('fbOauth')) {
     newLogin();
     }
     else {
     SocialLogin.fbUserData($scope.socialLogin.fbOauth.access_token).get(
     function (data) {
     $scope.userData = data;
     PersistenceService.setCurrentUserFromFb(data);
     $state.go('app.home');
     },
     function (error) {
     $log.error("FB EXPIRED? ", error);
     newLogin(); //FIXME da sistemare
     });

     }

     };

     $scope.google = function () {
     $log.debug("Google Login");
     function newLogin() {
     $cordovaOauth.google("126674953734-a12tq35lji49siice2havct204re7f1e.apps.googleusercontent.com", ["profile", "email"]).then(function (result) {
     $log.debug("Google OAUTH call: ", result);
     $scope.socialLogin.gOauth = result;
     PersistenceService.setSocialLogin($scope.socialLogin);
     $log.error(SocialLogin.gpUserData(result.access_token));
     SocialLogin.gpUserData(result.access_token).get(
     function (data) {
     $scope.userData = data;
     PersistenceService.setCurrentUserFromGp(data);
     $state.go('app.home');
     })
     }, function (error) {
     $log.debug("Google OAUT Error: ", error);
     });
     }

     if (!$scope.socialLogin.hasOwnProperty('gOauth')) {
     newLogin();
     }
     else {
     SocialLogin.gpUserData($scope.socialLogin.gOauth.access_token).get(
     function (data) {
     $scope.userData = data;
     PersistenceService.setCurrentUserFromGp(data);
     $state.go('app.home');
     },
     function (error) {
     if (error.status == "401") {
     newLogin();
     }
     }
     )
     }
     };

     $scope.twitter = function () {
     $log.debug("Twitter Login");
     if (!$scope.socialLogin.hasOwnProperty('tOauth')) {
     $cordovaOauth.twitter("TiJr4bdzM5hZ2GIy3PNOjDTMu", "lE4HDUmbikkhBRvffzz7evbUBk0707cBhGKxxlJeHaB9VR13Q7").then(function (result) {
     $log.debug("Twitter OAUTH call: ", result);
     $scope.socialLogin.tOauth = result;
     PersistenceService.setSocialLogin($scope.socialLogin);
     PersistenceService.setCurrentUserFromTw(result);
     $state.go('app.home');
     }, function (error) {
     $log.error("Twitter OAUT Error: ", error);
     });
     }
     else {
     PersistenceService.setCurrentUserFromTw($scope.socialLogin.tOauth);
     $state.go('app.home');
     }
     };

     $scope.noLogin = function () {
     $log.debug("No Login button");
     $state.go('app.home');
     }

     })
     */   //Old Login Ctrl
    .controller('TabCtrl', function ($scope, $cordovaOauth, StorageService, SocialLogin, $filter, $log, $ionicPopup,
                                     $rootScope, $ionicModal, $state, CatalogueService, UserService, $http, ServerServices, CONNECTION, $translate) {


        console.log($scope.test);

        $scope.connection = CONNECTION;


        $rootScope.language = {};
        $rootScope.language.code = "IT_it";
        //$scope.catalogo = catalogue;
        $scope.getCatalogueLang = function (lang) {
            CatalogueService.cat_lang(lang).then(function (result) {
                $scope.catalogo = result;
                console.log($scope.catalogo)
            });
        };

        $scope.showAlert = function (title, message) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                cssClass: "text-center",
                template: message
            });
            alertPopup.then(function (res) {
                //console.log('Thank you for not eating my delicious ice cream cone    '+res);
            });
        };


        $scope.getCatalogueLang($rootScope.language);
        /*       CatalogueService.all().then(function(result){

         });
         */
        $rootScope.connected = false;

        $scope.changeLanguage = function () {
            console.log($rootScope.language);
            if ($rootScope.language.code == "IT_it") {
                $translate.use("it");
                $scope.getCatalogueLang($rootScope.language);
                $scope.closeModal(3);
            }
            else if ($rootScope.language.code == "EN_en") {
                $translate.use("en");
                $scope.getCatalogueLang($rootScope.language);
                $scope.closeModal(3);
            }
        };
        $rootScope.user =
        {
            "userName": "",
            "email": "",
            "password": "",
            "cap": "",
            "country": "Italia",
            "state": "",
            "city": "",
            "address": "",
            "fiscalCode": "",
            "mobile": "",
            "telephone": "",
            "surname": "",
            "name": "",
            "streetNumber": ""
        };


        $scope.facebook = function () {
            $log.debug("Facebook Login");

            function newLogin() {
                $cordovaOauth.facebook("1444549142529527", ["public_profile", "email"]).then(function (result) {
                    //$log.debug("Facebook OAUTH call: ", result);
                    SocialLogin.fbUserData(result.access_token).get(
                        function (data) {
                            $rootScope.user.email = data.email;
                            $rootScope.user.password = "1515" + data.id;

                            console.log(JSON.stringify($rootScope.user));
                            ServerServices.loginRequest($rootScope)
                                .success(function (response) {
                                    StorageService.setUserFromLogin(response[0]);
                                    $rootScope.user = UserService.getCurrentUser();
                                    $rootScope.user.country = "Italia";

                                    $translate('LOGIN_SUCCESSFUL').then(function (result) {
                                        $scope.showAlert('', result);
                                    });
                                })
                                .error(function () {
                                    ServerServices.registrationRequest($rootScope.user)
                                        .success(function (response) {
                                            ServerServices.loginRequest($rootScope)
                                                .success(function (response) {
                                                    StorageService.setUserFromLogin(response[0]);
                                                    $rootScope.user = UserService.getCurrentUser();
                                                    $rootScope.user.country = "Italia";
                                                    $translate('LOGIN_SUCCESSFUL').then(function (result) {
                                                        $scope.showAlert('', result);
                                                    });
                                                })
                                                .error(function (response) {
                                                    $translate('LOGIN_FAILED').then(function (result) {
                                                        $scope.showAlert('', result);
                                                    });
                                                    console.log("Response login: " * response)
                                                })
                                        })
                                        .error(function (response) {
                                            console.log("response registrazione:  " + response)
                                        })
                                })
                        }
                    );
                }, function (error) {
                    $log.error("Facebook OAUT Error: ", error);
                });
            }

            newLogin();
            $scope.closeModal(1);
        };
        $scope.google = function () {
            $log.debug("Google Login");
            function newLogin() {
                $cordovaOauth.google("805005039542-i4t2nlh1rufretpon3iungh9ofrquld6.apps.googleusercontent.com", ["profile", "email"]).then(function (result) {
                    $log.debug("Google OAUTH call: ", result);
                    SocialLogin.gpUserData(result.access_token).get(
                        function (data) {
                            console.log(data);
                            $rootScope.user.email = data.emails[0].value;
                            $rootScope.user.password = "5151" + data.id;

                            ServerServices.loginRequest($rootScope)
                                .success(function (response) {
                                    StorageService.setUserFromLogin(response[0]);
                                    $rootScope.user = UserService.getCurrentUser();
                                    $rootScope.user.country = "Italia";
                                    $translate('LOGIN_SUCCESSFUL').then(function (result) {
                                        $scope.showAlert('', result);
                                    });
                                })
                                .error(function () {
                                    ServerServices.registrationRequest($rootScope.user)
                                        .success(function (response) {
                                            ServerServices.loginRequest($rootScope)
                                                .success(function (response) {
                                                    StorageService.setUserFromLogin(response[0]);
                                                    $rootScope.user = UserService.getCurrentUser();
                                                    $rootScope.user.country = "Italia";
                                                    $translate('LOGIN_SUCCESSFUL').then(function (result) {
                                                        $scope.showAlert('', result);
                                                    });
                                                })
                                                .error(function (response) {
                                                    $translate('LOGIN_FAILED').then(function (result) {
                                                        $scope.showAlert('', result);
                                                    });
                                                    console.log("Response login: " + JSON.stringify(response))
                                                })
                                        })
                                        .error(function (response) {
                                            console.log("response registrazione:  " + JSON.stringify(response))
                                        })
                                })

                        })
                }, function (error) {
                    $log.debug("Google OAUT Error: ", error);
                });
            }

            newLogin();
            $scope.closeModal(1);
        };
        $scope.logout = function () {
            $rootScope.connected = false;
            $rootScope.user = {};
            $state.go('tab.home');
            //window.location.href = "index.html";
        };

        $scope.doLogin = function () {


            ServerServices.loginRequest($rootScope.user)
                .success(function (response) {
                    $rootScope.connected = true;
                    console.log("login effettuato: " + $rootScope.user);

                    StorageService.setUserFromLogin(response[0]);

                    $rootScope.user = UserService.getCurrentUser();
                    $rootScope.user.country = "Italia";
                    console.log("Current user: " + JSON.stringify(UserService.getCurrentUser().name));
                    //$scope.trad=$translate('LOGIN_SUCCESSFUL');

                    $translate('LOGIN_SUCCESSFUL').then(function (result) {
                        $scope.showAlert('', result);
                    });


                    console.log("Nome: " + $rootScope.user.name);

                })
                .error(function () {
                    //$rootScope.user=undefined;
                    $translate('LOGIN_FAILED').then(function (result) {
                        $scope.showAlert('', result);
                    });
                    $rootScope.user = {};

                    //console.log("Errore" + JSON.stringify($rootScope.user));

                });

            $scope.closeModal(1);
        };

        $ionicModal.fromTemplateUrl('templates/modalLogin.html', {
            id: 1,
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.oModal1 = modal;
        });
        $ionicModal.fromTemplateUrl('templates/modalDataConfirm.html', {
            id: 2,
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.oModal2 = modal;
        });
        $ionicModal.fromTemplateUrl('templates/modalLanguage.html', {
            id: 3,
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.oModal3 = modal;
        });

        $ionicModal.fromTemplateUrl('templates/modalProduct.html', {
            id: 4,
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.oModal4 = modal;
        });
        $scope.openModal = function (index) {
            if (index == 1)
                $scope.oModal1.show();
            else if (index == 2)
                $scope.oModal2.show();
            else if (index == 3)
                $scope.oModal3.show();
            else if (index == 4)
                $scope.oModal4.show();
        };
        $scope.closeModal = function (index) {
            if (index == 1)
                $scope.oModal1.hide();
            else if (index == 2)
                $scope.oModal2.hide();
            else if (index == 3)
                $scope.oModal3.hide();
            else if (index == 4)
                $scope.oModal4.hide();
        };
        $scope.openRegistrazione = function () {
            $scope.closeModal(1);
            $state.go('tab.registrazione')
        };

    })
    .controller('EditCtrl', function ($scope, ServerServices, UserService, $rootScope) {
        $scope.userTemp =
        {
            "email": "",
            "old_password": "",
            "password": "",
            "name": "",
            "surname": "",
            "cap": "",
            "country": "",
            "state": "",
            "city": "",
            "address": "  ",
            "streetNumber": "",
            "telephone": ""

        }

        console.log("CurrentUser " + UserService.getCurrentUser());


        $scope.userTemp['email'] = UserService.getCurrentUser().email;
        $scope.userTemp['old_password'] = $rootScope.user.password;
        $scope.userTemp['name'] = UserService.getCurrentUser().name;
        $scope.userTemp['cap'] = UserService.getCurrentUser().cap;
        $scope.userTemp['country'] = UserService.getCurrentUser().country;
        $scope.userTemp['state'] = UserService.getCurrentUser().state;
        $scope.userTemp['city'] = UserService.getCurrentUser().city;
        $scope.userTemp['address'] = UserService.getCurrentUser().address;
        $scope.userTemp['telephone'] = UserService.getCurrentUser().telephone;
        $scope.userTemp['surname'] = UserService.getCurrentUser().surname;
        console.log($rootScope.user.password);

        console.log("UserTemp: " + JSON.stringify($scope.userTemp));

        $scope.editProfile = function () {
            ServerServices.EditProfileRequest($scope.userTemp)
                .success(function (response) {
                    console.log("RESPONSE: " + JSON.stringify(response[0]));
                    UserService.setCurrentUser(response[0]);
                    $rootScope.user = UserService.getCurrentUser();
                })
                .error(function (response) {
                    console.log("Defeat: " + response);
                })
        }

    })
    .controller('RegistrationCtrl', function ($scope, $rootScope, $state, $http, ServerServices, $translate) {

        $scope.doRegistration = function () {

            //$scope.user['email']='a@b.it';
            //$scope.user['password']='asd123';

            ServerServices.registrationRequest($rootScope.user)
                .success(function (response) {
                    console.log(response);
                    $rootScope.user = {};
                    $translate('REGISTRATION_SUCCESSFUL').then(function (result) {
                        $scope.showAlert('', result);
                    });
                })
                .error(function (response) {
                    $rootScope.user = {};
                    $translate('REGISTRATION_FAILED').then(function (result) {
                        $scope.showAlert('', result);
                    });
                    console.log("Errore" + JSON.stringify($rootScope.user));

                    console.log(response)
                });

            $state.go('tab.home')
        };
    })
;