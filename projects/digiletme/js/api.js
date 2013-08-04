'use strict';
/**
 * Project: digital-me.
 * Copyright (c) 2013, Eugene-Krevenets
 */

angular.module('ApiService', ['ngResource']).
    factory('Venue', function($resource) {
        return $resource('api/v1/venues/:venueId.json', {}, {
            query: {method:'GET', params:{venueId: 'venues'}, isArray:true}
        });
    });
