'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function($resource) {
    return $resource('users', {}, {
      update: {
        method: 'PUT'
      },
      join: {
        method: 'PUT',
        url: 'users/memberships/:campaignId'
      },
      leave: {
        method: 'DELETE',
        url: 'users/memberships/:campaignId'
      }
    });
  }
]);
