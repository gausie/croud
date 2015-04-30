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

      if (!this.campaign.location) {
        $scope.error = 'Location is required';
        return;
      }

      // Create new Campaign object
      var campaign = new Campaigns ({
        name: this.campaign.name,
        description: this.campaign.description,
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
    };

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
