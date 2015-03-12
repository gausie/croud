'use strict';

//Campaigns service used to communicate Campaigns REST endpoints
angular.module('campaigns').factory('Campaigns', ['$cachedResource',
  function($cachedResource) {
    return $cachedResource('campaigns', 'campaigns/:campaignId', { campaignId: '@_id'}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
