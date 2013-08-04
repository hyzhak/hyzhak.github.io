'use strict';
/**
 * Project: digital-me.
 * Copyright (c) 2013, Eugene-Krevenets
 */

angular.module('Venues', [])
    .factory('VenuesAPI', ['$q', '$resource', '$rootScope', function($q, $resource, $rootScope) {
        var CLIENT_ID = '2WYFEWX521WPPTCQ3MKLLEGAHOW3EHPGLF1H4KXDB5OCQYT5',
            CLIENT_SECRET = 'TJ0ORRJ4VPQFZHQ3USFLV2TVBYJRQ1O30ZY5RCNXL5SM23IF';

        var getCurrentPosition = (function() {
            return function () {
                var defer = $q.defer();
                navigator.geolocation.getCurrentPosition(function (pos) {
                    defer.resolve(pos);
                    $rootScope.$digest();
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
            '&categoryId=:categories' +
            '&client_id=' + CLIENT_ID +
            '&client_secret=' + CLIENT_SECRET +
            '&v=20130803', {
                limit: 50,
                radius: 100000
            }
        );

        var localVenues = null;

        return {
            getLocalVenues: function() {
                if (!localVenues) {
                    localVenues = getCurrentPosition()
                        .then(function (pos) {
                            var c = pos.coords,
                                ll = "" + c.latitude + "," + c.longitude
                            return ll;
                        })
                        .then(function (pos) {
                            return Venues.get({
                                pos: pos,
                                categories: catetories.join(',')
                            });
                        });
                }
                return localVenues;
            },

            getCurrentPosition: getCurrentPosition
        }
    }]);