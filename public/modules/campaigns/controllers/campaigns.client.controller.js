'use strict';

// Campaigns controller
angular.module('campaigns').controller('CampaignsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Campaigns', 'Points', 'leafletData',
  function($scope, $stateParams, $location, Authentication, Campaigns, Points, leafletData) {
    $scope.authentication = Authentication;

    // Start with empty Campaign.
    $scope.campaign = {};

    // Calendar stuff
    $scope.today = new Date();
    $scope.openCalendar = function ($event, field) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.openedCalendar = {};
      $scope.openedCalendar[field] = true;
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
        type: 'null',
        required: false
      });
    };

    // Remove field from Campaign.
    $scope.removeField = function(index) {
      $scope.campaign.fields.splice(index, 1);
    };

    // Create new Campaign
    $scope.create = function() {
      // Create new Campaign object
      var campaign = new Campaigns ({
        name: this.campaign.name,
        location: (this.campaign.location) ? this.campaign.location.array : null,
        zoom: (this.campaign.location) ? this.campaign.location.zoom : null,
        fields: this.campaign.fields,
        start: this.campaign.start,
        end: this.campaign.end,
        approvalRequired: this.campaign.approvalRequired
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
      // Change into Mongo-acceptable format
      campaign.zoom = campaign.location.zoom;
      campaign.location = [campaign.location.lng, campaign.location.lat];
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

    // Find existing Campaign
    $scope.findOne = function() {
      $scope.campaign = Campaigns.get({
        campaignId: $stateParams.campaignId
      }, function() {
        $scope.campaign.location = {
          'lng': $scope.campaign.location[0],
          'lat': $scope.campaign.location[1],
          'zoom': $scope.campaign.zoom
        };
      });
    };

    $scope.loadPoints = function() {
      $scope.markers = {};
      $scope.$on('leafletDirectiveMap.moveend', function() {
        leafletData.getMap().then(function(map) {
          var bounds = map.getBounds();
          Points.query({
            campaign: $scope.campaign._id,
            bounds: bounds.toBBoxString()
          }, function(points) {
            var markers = {};
            points.forEach(function(point) {
              markers[point._id] = {
                'lng': point.location[0],
                'lat': point.location[1]
              };
            });
            $scope.markers = markers;
          });
        });
      });
    };
  }
]);
