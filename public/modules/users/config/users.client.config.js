'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider', '$stateProvider',
  function($httpProvider, $stateProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function($q, $location, Authentication) {
        return {
          responseError: function(rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);

    // Users state routing
    $stateProvider.
    state('viewUser', {
      url: '/users/:userId',
      templateUrl: 'modules/users/views/view-user.client.view.html'
    });
  }
]);
