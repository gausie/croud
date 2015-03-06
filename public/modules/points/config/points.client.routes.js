'use strict';

//Setting up route
angular.module('points').config(['$stateProvider',
  function($stateProvider) {
    // Points state routing
    $stateProvider.
    state('listPoints', {
      url: '/points',
      templateUrl: 'modules/points/views/list-points.client.view.html'
    }).
    state('createPoint', {
      url: '/points/create',
      templateUrl: 'modules/points/views/create-point.client.view.html'
    }).
    state('viewPoint', {
      url: '/points/:pointId',
      templateUrl: 'modules/points/views/view-point.client.view.html'
    }).
    state('editPoint', {
      url: '/points/:pointId/edit',
      templateUrl: 'modules/points/views/edit-point.client.view.html'
    }).
    state('listUserPoints', {
      url: '/users/:userId/points',
      templateUrl: 'modules/points/views/list-points.client.view.html'
    });
  }
]);
