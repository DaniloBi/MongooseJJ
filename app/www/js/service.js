angular.module('starter.services', ['ngResource', 'LocalForageModule'])

    .constant("CONNECTION", {
        //url: "  http://5.98.13.100:8080/MountainCMS/"
        url: "http://192.168.1.27:8181/EcommerceWeb/FrontEnd2"
        //url: "http://213.183.145.11:8181/EcommerceWeb/FrontEnd2"
        //CAMBIARE LA RICHIESTA CATALOGO SOTTO - INSERIRE IL SERVIZIO
    })

    .factory("ServerServices", function ($http, $resource, CONNECTION, UserService, StorageService) {

        return {
            serverLink: CONNECTION.url + '/EcommerceWeb/FrontEnd2/services/',

            loginRequest: function (user) {
                return $http.post(CONNECTION.url + '/services/login/login.do', user)
            },
            registrationRequest: function (user) {
                return $http.post(CONNECTION.url + '/services/registration/registration.do', user)
            },
            EditProfileRequest: function (user) {
                return $http.post(CONNECTION.url + '/services/profile/edit.do', user)
            },
            orderCreation: function (user) {
                return $http.post(CONNECTION.url + '/services/order_creation/create.do', user)
            },
            orderConfermation: function (datiUser) {
                return $http.post(CONNECTION.url + "/services/order_confirm/confirm.do", datiUser)
            },
            orderList: function (user) {
                //return $resource(CONNECTION.url + "/services/orders/list.do", user).query().$promise;
                return $http.post(CONNECTION.url + "/services/orders/list.do", user);
            },

            faqListRequest: function () {
                return $resource(CONNECTION.url + "/services/faq/list.do").query().$promise;
            }
        }
    })

    .factory("StorageService", function ($localForage, UserService, $rootScope) {

        var wishList = [];
        return {
            setSocialLogin: function (data) {
                $localForage.setItem('socialLogin', data);
            },
            getSocialLogin: function () {
                return $localForage.getItem('socialLogin')
                    .then(function (data) {
                        return data;
                    });
            },
            setCurrentUserFromFb: function (data) {
                var user = {};
                user.name = data['first_name'];
                user.username = "fb_" + data['id'];
                user.surname = data['last_name'];
                user.email = data.email;
                $localForage.setItem('currentUser', user);
                $localForage.getItem('currentUser').then(function (data) {
                });
            },
            setCurrentUserFromGp: function (data) {
                var user = {};
                user.name = data['name']['givenName'];
                user.username = "gp_" + data['id'];
                user.surname = data['name']['familyName'];
                user.email = data['emails'][0]['value'];
                UserService.setCurrentUser(user);
                $localForage.setItem('currentUser', user);

            },
            setUserFromLogin: function (data) {
                var user = {};
                user.name = data['name'];
                user.surname = data['surname'];
                user.email = data['email'];
                user.userName = data['userName'];
                user.cap = data['cap'];
                user.country = data['country'];
                user.state = data['state'];
                user.city = data['city'];
                user.address = data['address'];
                user.mobile = data['mobile'];
                user.telephone = data['telephone'];
                user.streetNumber = data['streetNumber'];
                user.password = $rootScope.user.password;

                UserService.setCurrentUser(user);
                $localForage.setItem('currentUser', user);
            },
            setWishList: function (data) {
                wishList.push(data);
                $localForage.setItem('wishlist', wishList);

            },
            removeWishlist: function (data) {
                var index = wishList.indexOf(data);
                wishList.splice(index, 1);
                $localForage.setItem('wishlist', wishList);
                $localForage.getItem('wishlist').then(function (data) {
                    console.log(data);
                    return data;
                });


            },
            getWishList: function () {
                return wishList;
                /* $localForage.getItem('wishlist').then(function (data) {
                 console.log(data);
                 return data;
                 });*/
            }
        }
    })
    .factory("SocialLogin", ['$resource', function ($resource) {
        return {
            fbUserData: function (accessToken) {
                return $resource('https://graph.facebook.com/:endpoint', {endpoint: 'me', access_token: accessToken});
            },
            gpUserData: function (accessToken) {
                return $resource('https://www.googleapis.com/plus/v1/people/:endpoint', {
                    endpoint: 'me',
                    access_token: accessToken
                });
            }
        }
    }])

    .factory("CatalogueService", function ($resource, filterFilter, $q, CONNECTION) {
        //var catalogue = $resource('json/catalogue.json');
        //console.log($rootScope.language);
        //var catalogue = $resource(CONNECTION.url+"/services/catalogue/all.do",{"code":"EN_en"});


        return {


            all: function all() {
                return catalogue.query().$promise
            },
            cat_lang: function cat_lang(lang) {
                return $resource(CONNECTION.url + "/services/catalogue/all.do", lang).query().$promise;
            },
            filterCat: function filterCat(id) {
                var deferred = $q.defer();

                catalogue.query().$promise.then(function (data) {

                    deferred.resolve(filterFilter(data, {oid: id})[0]);
                });
                return deferred
            },

            filterProd: function filterProd(id, prod) {
                var deferred = $q.defer();

                catalogue.query().$promise.then(function (data) {

                    var cat = filterFilter(data, {oid: id})[0];

                    deferred.resolve(filterFilter(cat.product, {code: prod})[0]);
                });
                return deferred
            }
        }
    })


    .factory("UserService", [function () {

        var currentUser = {};


        return {

            setCurrentUser: function (data) {
                currentUser = data;
            },
            getCurrentUser: function () {
                return currentUser;
            }
        }
    }])



