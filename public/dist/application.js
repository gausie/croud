'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
  // Init module configuration options
  var applicationModuleName = 'croud';
  var applicationModuleVendorDependencies = [
    'ngResource',
    'ngCookies',
    'ngAnimate',
    'ngTouch',
    'ngSanitize',
    'ngCachedResource',
    'ui.router',
    'ui.bootstrap',
    'ui.utils',
    'ui.select',
    'leaflet-directive',
    'angularMoment',
    'angularFileUpload'
  ];

  // Add a new vertical module
  var registerModule = function(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);

/**
 * Convert JSON dates into JavaScript dates.
 * Copied from http://aboutcode.net/2013/07/27/json-date-parsing-angularjs.html
 */
var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;
function convertDateStringsToDates(input) {
    // Ignore things that aren't objects.
    if (typeof input !== "object") return input;

    for (var key in input) {
        if (!input.hasOwnProperty(key)) continue;

        var value = input[key];
        var match;
        // Check for string properties which look like dates.
        if (typeof value === "string" && (match = value.match(regexIso8601))) {
            var milliseconds = Date.parse(match[0])
            if (!isNaN(milliseconds)) {
                input[key] = new Date(milliseconds);
            }
        } else if (typeof value === "object") {
            // Recurse into object
            convertDateStringsToDates(value);
        }
    }
}
angular.module(ApplicationConfiguration.applicationModuleName).config(["$httpProvider", function ($httpProvider) {
  $httpProvider.defaults.transformResponse.push(function(responseData){
    convertDateStringsToDates(responseData);
    return responseData;
  });
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_') window.location.hash = '#!';

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('campaigns');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('points', ['campaigns']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Campaigns module
angular.module('campaigns').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Campaigns', 'campaigns', 'dropdown', '/campaigns(/create)?');
    Menus.addSubMenuItem('topbar', 'campaigns', 'View Campaigns', 'campaigns');
    Menus.addSubMenuItem('topbar', 'campaigns', 'Create Campaign', 'campaigns/create');
  }
]);

'use strict';

//Setting up route
angular.module('campaigns').config(['$stateProvider',
  function($stateProvider) {
    // Campaigns state routing
    $stateProvider.
    state('listCampaigns', {
      url: '/campaigns',
      templateUrl: 'modules/campaigns/views/list-campaigns.client.view.html'
    }).
    state('createCampaign', {
      url: '/campaigns/create',
      templateUrl: 'modules/campaigns/views/create-campaign.client.view.html'
    }).
    state('viewCampaign', {
      url: '/campaigns/:campaignId',
      templateUrl: 'modules/campaigns/views/view-campaign.client.view.html'
    }).
    state('editCampaign', {
      url: '/campaigns/:campaignId/edit',
      templateUrl: 'modules/campaigns/views/edit-campaign.client.view.html'
    });
  }
]);
'use strict';

// Campaigns controller
angular.module('campaigns').controller('CampaignsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Campaigns', 'Points', 'Users', 'leafletData', 'moment',
  function($scope, $stateParams, $location, $http, Authentication, Campaigns, Points, Users, leafletData, moment) {
    $scope.authentication = Authentication;

    // Start with empty Campaign.
    $scope.campaign = {};
    $scope.center = {};

    $scope.now = new Date();

    // Calendar stuff
    $scope.openCalendar = function ($event, field) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.openedCalendar = {};
      $scope.openedCalendar[field] = true;
    };

    $scope.daysSince = function(date) {
      return (date) ? moment().diff(moment(date), 'days') : false;
    };

    $scope.fieldTypes = [
      { key: 'text', value: 'Text' },
      { key: 'number', value: 'Number' },
      { key: 'select', value:'Multiple Choice' },
      { key: 'boolean', value: 'Boolean' },
      { key: 'image', value: 'Image' }
    ];

    $scope.loadIcons = function() {
      $http.get('modules/core/data/fontAwesomeIcons.json').then(function(res){
        $scope.icons = res.data.icons;
      });
    };

    // Add select option to field.
    $scope.addOption = function(field) {
      // Create fields array if one doesn't exist.
      if ($scope.campaign.fields[field].options === undefined) {
        $scope.campaign.fields[field].options = [];
      }

      // Add a new default blank field
      $scope.campaign.fields[field].options.push({
        name: '',
        icon: null
      });
    };

    // Remove field from Campaign.
    $scope.removeOption = function(field, index) {
      $scope.campaign.fields[field].options.splice(index, 1);
    };

    // Add field to Campaign.
    $scope.addField = function() {
      // Create fields array if one doesn't exist.
      if ($scope.campaign.fields === undefined) {
        $scope.campaign.fields = [];
      }

      // Add a new default blank field
      $scope.campaign.fields.push({
        name: '',
        type: null,
        required: false
      });
    };

    // Remove field from Campaign.
    $scope.removeField = function(index) {
      $scope.campaign.fields.splice(index, 1);
    };

    // Create new Campaign
    $scope.create = function() {
      // Validation
      if (!this.campaign.name) {
        $scope.error = 'Campaign name is required.';
        return;
      }

      // Create new Campaign object
      var campaign = new Campaigns ({
        name: this.campaign.name,
        location: this.campaign.location,
        fields: this.campaign.fields,
        start: this.campaign.start,
        end: this.campaign.end,
        approvalRequired: this.campaign.approvalRequired,
        private: this.campaign.private,
        fieldAsMarker: this.campaign.fieldAsMarker,
        stale: this.campaign.stale
      });

      // Redirect after save
      campaign.$save(function(response) {
        $location.path('campaigns/' + response._id);

        // Clear form fields
        $scope.name = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Campaign
    $scope.remove = function(campaign) {
      if ( campaign ) {
        campaign.$remove();

        for (var i in $scope.campaigns) {
          if ($scope.campaigns [i] === campaign) {
            $scope.campaigns.splice(i, 1);
          }
        }
      } else {
        $scope.campaign.$remove(function() {
          $location.path('campaigns');
        });
      }
    };

    // Update existing Campaign
    $scope.update = function() {
      var campaign = $scope.campaign;
      campaign.$update(function() {
        $location.path('campaigns/' + campaign._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Campaigns
    $scope.find = function() {
      $scope.campaigns = Campaigns.query();
    };

    // Find a list of Campaigns User has joined.
    $scope.findJoined = function() {
      if ($scope.authentication) {
        $scope.joinedCampaigns = Campaigns.query({
          mine: true,
          includeClosed: true
        });
      } else {
        $scope.joinedCampaigns = [];
      }
    };

    // Find existing Campaign
    $scope.findOne = function() {
      $scope.campaign = Campaigns.get({
        campaignId: $stateParams.campaignId
      }, function() {
        $scope.center = $scope.campaign.location;

        // Determine which controls to display
        $scope.$watch('authentication.user', function(user) {
          if (user) {
            if (user._id === $scope.campaign.user._id) {
              $scope.controls = 'owner';
            } else if (user.memberships.indexOf($scope.campaign._id) > -1) {
              $scope.controls = 'member';
            } else {
              $scope.controls = 'user';
            }
          } else {
            $scope.controls = 'none';
          }
        });
      });
    };

    $scope.users = [];
    $scope.refreshUsers = function(name) {
      $scope.users = Users.query({
        q: name
      });
    };

    $scope.toggleJoin = function(campaign) {
      var user = new Users($scope.campaign.userToInvite || Authentication.user);
      if (user.memberships.indexOf($scope.campaign._id) > -1) {
        $scope.leave();
      } else {
        $scope.join();
      }
    }

    $scope.join = function() {
      var user = new Users($scope.campaign.userToInvite || Authentication.user);
      user.$join({
        campaignId: $scope.campaign._id
      }, function(response) {
        if (!$scope.campaign.userToInvite) {
          $scope.authentication.user = response;
        }
      });
    };

    $scope.leave = function(userId) {
      var user = new Users($scope.campaign.userToInvite || Authentication.user);
      user.$leave({
        campaignId: $scope.campaign._id
      }, function(response) {
        if (!$scope.campaign.userToInvite) {
          $scope.authentication.user = response;
        }
      });
    };

    $scope.findPoints = function() {
      /*
       * When a marker is clicked, show the user a page for the point
       */
      $scope.$on('leafletDirectiveMarker.click', function (e, args) {
        $location.path('points/' + args.markerName);
      });

      /*
       * When the map viewport is moved (this also happens on map load,
       * find all the points that should be displayed
       */
      $scope.$on('leafletDirectiveMap.moveend', function() {
        leafletData.getMap().then(function(map) {
          var bounds = map.getBounds();
          Points.query({
            campaign: $stateParams.campaignId,
            bounds: bounds.toBBoxString()
          }, function(points) {
            var markers = {};
            points.forEach(function(point) {
              /*
               * Use an icon class if the campaign is configured to use
               * a field as a marker.
               */
              var className = ($scope.campaign.fieldAsMarker && point.data && point.data[$scope.campaign.fieldAsMarker]) ? 'fa fa-' + point.data[$scope.campaign.fieldAsMarker].icon : 'icon';

              /*
               * If the campaign is configured to allow points to go
               * stale, apply an opacity filter to the icons.
              */
              if ($scope.campaign.stale) {
                var age = $scope.daysSince(point.created);
                if (age >= $scope.campaign.stale) {
                  className += ' stale';
                }
              }

              var marker = angular.extend({}, point.location, {
                icon: {
                  type: 'div',
                  iconSize: [10, 10],
                  className: className,
                  iconAnchor: [5, 5]
                }
              });
              markers[point._id] = marker;
            });
            $scope.markers = markers;
          });
        });
      });
    };
  }
]);

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

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');

    // Home state routing
    $stateProvider.
    state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function($scope, $state, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.$state = $state;

    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);
'use strict';

angular.module('core').directive('locationPicker', [
  function() {
    return {
      templateUrl: 'modules/core/views/location-picker.client.view.html',
      restrict: 'E',
      scope: {
        defaultCenter: '=?',
        location: '=',
        staticGetter: '&static'
      },
      controller: ["$scope", "leafletData", function ($scope, leafletData) {
        // The inbuilt default center is the center of the world according
        // to the somewhat racist Western understanding of the world map.
        var defaultCenter = {
          lat: 40.87,
          lng: 34.57,
          zoom: 1
        };

        // If user does not specify a default center, pick a
        // default default center.
        if (!$scope.defaultCenter) {
          $scope.defaultCenter = defaultCenter;
        } else {
          $scope.defaultCenter = angular.extend({}, defaultCenter, $scope.defaultCenter);
        }

        // Determine whether we are static or not (default false).
        $scope.static = $scope.staticGetter() || false;

        // Set initial values.
        $scope.center = $scope.defaultCenter;

        // Reset the map.
        $scope.resetMap = function() {
          leafletData.getMap().then(function(map) {
            map.invalidateSize();
          });
        };

        // Move or create marker at given coords.
        $scope.moveMarker = function(coords) {
          var marker = {
            lat: coords.lat,
            lng: coords.lng,
          };

          // Either create or update a single marker.
          if (!$scope.markers || $scope.markers.length < 1) {
            $scope.markers = [marker];
          } else {
            $scope.markers[0] = marker;
          }
        };

        // Add marker to geolocation.
        $scope.dropPin = function() {
          var self = this;
          leafletData.getMap().then(function(map) {
            map.locate({ setView: true }).on('locationfound', function(e) {
              if (!$scope.static) {
                $scope.location = {
                  lng: e.longitude,
                  lat: e.latitude,
                  zoom: $scope.center.zoom
                };
              }
            });
          });
        };

      }],
      link: function postLink ($scope, element, attrs) {
        $scope.$watch('location', function (v) {
          if (v) {
            $scope.moveMarker(v);
            $scope.center = v;
          } else {
            $scope.markers = [];
            $scope.center = $scope.defaultCenter;
          }
        }, true);

        // Set map marker on click.
        $scope.$on('leafletDirectiveMap.click', function(event, args){
          if (!$scope.static) {
            var coords = args.leafletEvent.latlng;
            var obj = {
              lat: coords.lat,
              lng: coords.lng,
              zoom: $scope.center.zoom
            };

            if ($scope.location) {
              angular.extend($scope.location, obj);
            } else {
              $scope.location = obj;
            }
          }
        });

        $scope.resetMap();

        $scope.$on('resetMap', $scope.resetMap);
      }
    };
  }
]);

'use strict';

angular.module('core').filter('mongogeo', [
	function() {
		return function(input, direction) {
      if (!input) {
        return undefined;
      } else if (direction === 'in') {
        return [input.lng, input.lat];
      } else {
        console.dir(input);
        return {
          lng: input[0],
          lat: input[1]
        };
      }
		};
	}
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

  function() {
    // Define a set of default roles
    this.defaultRoles = ['*'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision 
    var shouldRender = function(user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function(menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function(menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function(menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function(menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || ('/' + menuItemURL),
        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
        roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || ('/' + menuItemURL),
            isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
            roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
            position: position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function(menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function(menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar');
  }
]);
'use strict';

// Configuring the Points module
angular.module('points').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', '<i class="fa fa-map-marker"></i> Add a point!', 'createPoint', 'button', undefined, undefined, undefined, -1);
  }
]);

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

'use strict';

// Points controller
angular.module('points').controller('PointsController', ['$scope', '$stateParams', '$location', '$upload', 'Authentication', 'Points', 'Campaigns', 'moment',
  function($scope, $stateParams, $location, $upload, Authentication, Points, Campaigns, moment) {
    $scope.authentication = Authentication;
    $scope.point = {};

    $scope.daysSince = function(date) {
      return (date) ? moment().diff(moment(date), 'days') : false;
    };

    // Create new Point
    $scope.create = function() {
      var self = this;

      // Start validation.
      var errors = [];

      // Validate that a location has been supplied.
      if (!this.point.location) {
        errors.push('You must specify a location.');
      }

      var files = [];

      // Validate custom fields.
      if (this.point.campaign.fields) {
        this.point.campaign.fields.forEach(function(field) {
          if (field.required) {
            if (self.point.data === undefined || self.point.data[field.name] === undefined || self.point.data[field.name] === '') {
              errors.push('"' + field.name + '" is a required field.');
            }
          }
          if (field.type === 'image') {
            var file = self.point.data[field.name][0];
            var ext = file.name.split('.').pop();
            files.push({
              name: field.name,
              file: file
            });
            self.point.data[field.name] = ext;
          }
        });
      }

      // Finish validation
      if (errors.length > 0) {
          $scope.errors = errors;
          return;
      }

      // Create new Point object
      var point = new Points ({
        campaign: this.point.campaign._id,
        location: this.point.location,
        data: this.point.data
      });

      // Redirect after save
      point.$save(function(response) {
        // Upload images
        files.forEach(function(file){
          $upload.upload({
            url: 'points/' + point._id + '/upload',
            file: file.file,
            fields: {
              'name': file.name
            }
          });
        });

        // Redirect
        $location.path('points/create');

        // Reset the form
        $scope.point = {};
        $scope.$broadcast('resetMap');
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.$watch('campaign', function(v) {
      $scope.$broadcast('resetMap');
    });

    // Remove existing Point
    $scope.remove = function(point) {
      if ( point ) {
        point.$remove();

        for (var i in $scope.points) {
          if ($scope.points [i] === point) {
            $scope.points.splice(i, 1);
          }
        }
      } else {
        $scope.point.$remove(function() {
          $location.path('points');
        });
      }
    };

    // Update existing Point
    $scope.update = function() {
      var point = $scope.point;

      point.$update(function() {
        $location.path('points/' + point._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Points
    $scope.find = function() {
      $scope.points = Points.query({
          user: $stateParams.userId
      }, function() {
        if ($stateParams.userId) {
          if ($stateParams.userId === $scope.authentication.user._id) {
            $scope.name = 'My';
          } else {
            $scope.name = $scope.points[0].user.displayName + '\'s';
          }
        }
      });
    };

    // Find existing Point
    $scope.findOne = function() {
      $scope.point = Points.get({
        pointId: $stateParams.pointId
      }, function() {
        $scope.location = angular.extend({}, $scope.point.location, {
          zoom: $scope.point.campaign.location.zoom
        });
      });
    };

    // Find a list of Campaigns of which the User is a member.
    $scope.findCampaigns = function() {
      $scope.campaigns = Campaigns.query({
          mine: true
      });
    };
  }
]);

'use strict';

angular.module('points').filter('sanitizeFilename', [
	function() {
		return function(input) {
			/**
			 * Copied from the sanitize-filename npm package.
			 */
			var illegalRe = /[\/\?<>\\:\*\|":]/g;
			var controlRe = /[\x00-\x1f\x80-\x9f]/g;
			var reservedRe = /^\.+$/;
			var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

			function sanitize(input, replacement) {
			  return input
			    .replace(illegalRe, replacement)
			    .replace(controlRe, replacement)
			    .replace(reservedRe, replacement)
			    .replace(windowsReservedRe, replacement);
			}
			return sanitize(input, '');
		};
	}
]);
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

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function($stateProvider) {
    // Users state routing
    $stateProvider.
    state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).
    state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).
    state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).
    state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).
    state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).
    state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).
    state('reset-invalid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).
    state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).
    state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    });
  }
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
  function($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) $location.path('/');

    $scope.signup = function() {
      $http.post('/auth/signup', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the index page
        $location.path('/');
      }).error(function(response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function() {
      $http.post('/auth/signin', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the index page
        $location.path('/');
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
  function($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;

    //If user is signed in then redirect back home
    if ($scope.authentication.user) $location.path('/');

    // Submit forgotten password account id
    $scope.askForPasswordReset = function() {
      $scope.success = $scope.error = null;

      $http.post('/auth/forgot', $scope.credentials).success(function(response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function(response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function() {
      $scope.success = $scope.error = null;

      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // If user is not signed in then redirect back home
    if (!$scope.user) $location.path('/');

    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function(provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function(provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function(provider) {
      $scope.success = $scope.error = null;

      $http.delete('/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function(response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function(response) {
        $scope.error = response.message;
      });
    };

    // Update a user profile
    $scope.updateUserProfile = function(isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);

        user.$update(function(response) {
          $scope.success = true;
          Authentication.user = response;
        }, function(response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };

    // Change user password
    $scope.changeUserPassword = function() {
      $scope.success = $scope.error = null;

      $http.post('/users/password', $scope.passwordDetails).success(function(response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
  function() {
    var _this = this;

    _this._data = {
      user: window.user
    };

    return _this._data;
  }
]);
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
