'use strict';
/**
 * Project: digital-me.
 * Copyright (c) 2013, Eugene-Krevenets
 */

digiletme.controller('MapCtrl', ['VenuesAPI', '$scope', '$rootScope', '$resource', '$q', function(VenuesAPI, $scope, $rootScope, $resource, $q) {
    $scope.center = {
        zoom: 10
    };

    $scope.markers = {};

    $scope.events = {
        dblclick: function(){
            console.log(marker);

        },
        click: function(marker) {
            console.log(marker);
        }
    };

    $scope.$on('leafletDirectiveMarkersClick', function(e, id) {
        console.log(id);
        $rootScope.$broadcast('selectVenue', id);
    });

    VenuesAPI.getCurrentPosition().then(function(pos) {
        var c = pos.coords;
        $scope.center.lat = c.latitude;
        $scope.center.lng = c.longitude;
    });

    VenuesAPI.getLocalVenues().then(function(resource) {
        resource.$then(function(result) {
            var venues = result.data.response.venues;
            for(var i = 0, count = venues.length; i < count; i++) {
                var venue = venues[i];

                $scope.markers[venue.id] = {
                    lat: venue.location.lat,
                    lng: venue.location.lng,
                    message: venue.name,
                    focus: true
                };
            }
        })
    });
}]);