'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$cachedResource',
  function($cachedResource) {
    return $cachedResource('users', 'users', { userId: '@_id' }, {
      update: {
        method: 'PUT'
      },
      join: {
        method: 'PUT',
        url: 'users/:userId/memberships/:campaignId'
      },
      leave: {
        method: 'DELETE',
        url: 'users/:userId/memberships/:campaignId'
      }
    });
  }
]);
