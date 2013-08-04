/**
 * Project: digital-me.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var digiletme = angular.module('digiletme', [
        'ApiService',
        'leaflet-directive',
        'Venues'
    ]),
    CLIENT_ID = '2WYFEWX521WPPTCQ3MKLLEGAHOW3EHPGLF1H4KXDB5OCQYT5',
    CLIENT_SECRET = 'TJ0ORRJ4VPQFZHQ3USFLV2TVBYJRQ1O30ZY5RCNXL5SM23IF';

digiletme
    .config(['$httpProvider', function($httpProvider) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"]
    }])

digiletme.controller('SearchResultCtrl', ['$scope', 'VenuesAPI', '$http', '$resource', '$q', '$location', function($scope, VenuesAPI, $http, $resource, $q, $location) {
    /*$scope.venues = Venue.query();
    $scope.budva = Venue.get({venueId: 'budva-bus-station'});*/


    var getCurrentPosition = (function() {
        return function () {
            var defer = $q.defer();
            navigator.geolocation.getCurrentPosition(function (pos) {
                defer.resolve(pos);
                $scope.$digest();
            }, function(error) {
                console.log(error);
                defer.reject(error);
            });
            return defer.promise;
        }
    })();

//    '4d4b7105d754a06379d81259'  //Путешествия и транспорт
    var catetories = [
//        '4bf58dd8d48988d1ed931735', //Аэропорт / Аэропорт
//        '4e4c9077bd41f78e849722f9', //Велопрокат / Велопрокат
        '4bf58dd8d48988d1fe931735', //Автовокзал / Автовокзал
//        '4e51a0c0bd41d3446defbb2e', //Паром / Паром
//        '4bf58dd8d48988d1f6931735', //Путешествия - Общее / Путешествия ?
//        '4bf58dd8d48988d1fc931735', //Легкорельсовая линия / Легкорельсовая линия
//        '4f2a23984b9023bd5841ed2c', //Подвижный объект / Подвижный объект
//        '4bf58dd8d48988d1ef941735', //Автопрокат / Автопрокат
//        '4bf58dd8d48988d1f9931735', //Дорога / Дорога
//        '4bf58dd8d48988d1fd931735', //Метро / Метро
//        '4bf58dd8d48988d130951735', //Такси / Такси
//        '4f4530164b9074f6e4fb00ff', //Справочный пункт / Справочный пункт
//        '4bf58dd8d48988d129951735', //Железнодорожный вокзал / Железнодорожный вокзал
    ];

    var Venues = $resource(
        'https://api.foursquare.com/v2/venues/search' +
        '?ll=:pos' +
        '&intent=browse' +
        '&limit=:limit' +
        '&radius=:radius' +
        '&categoryId=:catetories' +
        '&client_id=' + CLIENT_ID +
        '&client_secret=' + CLIENT_SECRET +
        '&v=20130803', {
            limit: 50,
            radius: 100000
        }
    );

    var VenuesExplore = $resource(
        'https://api.foursquare.com/v2/venues/explore' +
        '?ll=:pos' +
        '&query=:query' +
        '&limit=:limit' +
        '&radius=:radius' +
        '&offset=:offset' +
        '&venuePhotos=1' +
        '&client_id=' + CLIENT_ID +
        '&client_secret=' + CLIENT_SECRET +
        '&v=20130803', {
            limit: 50,
            offset: 0,
            radius: 100000
        }
    );

    $scope.venuesWithoutPhotos = [];

    $scope.venues = VenuesAPI.getLocalVenues();
    /*$scope.venues = getCurrentPosition()
        .then(function (pos) {
            var c = pos.coords,
                ll = "" + c.latitude + "," + c.longitude
            return ll;
        })
        .then(function (pos) {
            //return $http.get('https://api.foursquare.com/v2/venues/search?ll=' + pos +
            return Venues.get({pos: pos, catetories: catetories.join(',')});
//            return VenuesExplore.get({pos: pos, query: 'bus'});
        });*/

    $scope.concat4SQImg = function(icon, width, height) {
        if (!icon.prefix || !icon.suffix) {
            return '';
        }
        var prefix = icon.prefix.substr(0, icon.prefix.length - 1),
            middle = '',
            suffix = icon.suffix;

        if (width && height) {
            middle = '/' + width + 'x' + height;
        }

        return prefix + middle + suffix;
    };

    $scope.getDivStyleFor4SQImg = function(icon, width, height) {
        return {
            backgroundImage: 'url(\'' + $scope.concat4SQImg(icon, width, height) + '\')'
        };
    };

    $scope.getPhotosOfVenue = (function() {
        var cachedValue = {};
        return function(venue) {
            if (!cachedValue[venue.id]) {
                cachedValue[venue.id] = getPhotos(venue.id)
                    .then(function(result) {
                        cachedValue[venue.id] = result;

                        var hasPhotos = result.length > 0;
                        venue.visible = hasPhotos;
                        if (!hasPhotos) {
                            $scope.venuesWithoutPhotos.push(venue);
                        }
                    });
            }

            return cachedValue[venue.id];
        };
    })();

    function getPhotos(id) {
        return $scope.getVenueById(id)
            .$then(function(result) {
                var photos = [];
                var groups = result.data.response.venue.photos.groups;
                for(var i = 0, count = groups.length; i < count; i++) {
                    var items = groups[i].items;
                    for(var j = 0, jCount = items.length; j < jCount; j++) {
                        photos.push(items[j]);
                    }
                }

                return photos;
            });
    }

    var Venue = $resource('https://api.foursquare.com/v2/venues/:venueId' +
        '?client_id=' + CLIENT_ID +
        '&client_secret=' + CLIENT_SECRET +
        '&v=20130803');

    var cachedVenue = {};
    $scope.getVenueById = function(id) {
        if (!cachedVenue[id]) {
            cachedVenue[id] = Venue.get({venueId: id});
        }

        return cachedVenue[id];
    };

    var GoogleReverseGeocoding = $resource(
        'http://maps.googleapis.com/maps/api/geocode/json' +
            '?latlng=:pos' +
            '&language=en' +
            '&sensor=false'
    , {

    });

    $scope.getAddressOfVenue =(function() {
        var cachedValue = {}
        return function(venue) {
            if (!cachedValue[venue.id]) {
                if (venue.location.city) {
                    cachedValue[venue.id] = (venue.location.address?(venue.location.address + ', '):'') +
                        (venue.location.city?(venue.location.city + ', '):'') +
                        (venue.location.country?venue.location.country:'');
                } else {
                    cachedValue[venue.id] = GoogleReverseGeocoding.get({pos: venue.location.lat + ',' + venue.location.lng})
                        .$then(function(result) {
                            if (result.data.results.length <= 0) {
                                return 'unknown';
                            }

                            cachedValue[venue.id] = result.data.results[0].formatted_address;
                            return cachedValue[venue.id];
                        });
                }
            }
            return cachedValue[venue.id];
        };
    })();

    $scope.$on('selectVenue', function(e, id) {
        $location.hash(id);
    });
}]);

/*digiletme.config(['FoursquareProvider', function(FoursquareProvider){
    FoursquareProvider.token = '2WYFEWX521WPPTCQ3MKLLEGAHOW3EHPGLF1H4KXDB5OCQYT5';
}]);*/

/*
digiletme.controller('SearchResultCtrl', ['$scope', 'Foursquare', function($scope, Foursquare) {
    'use strict';
    */
/*$scope.user = Foursquare.Users.get({
        userId: 'self'
    });*//*


    navigator.geolocation.getCurrentPosition(function (pos) {
        $scope.$apply(function () {
            $scope.venues = Foursquare.search(pos)
        })
    });
}]);*/
