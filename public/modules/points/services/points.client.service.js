'use strict';

//Points service used to communicate Points REST endpoints
angular.module('points').factory('Points', ['$cachedResource',
  function($cachedResource) {
    return $cachedResource('points', 'points/:pointId', { pointId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
