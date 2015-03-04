'use strict';

// Points controller
angular.module('points').controller('PointsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Points', 'Campaigns',
  function($scope, $stateParams, $location, Authentication, Points, Campaigns) {
    $scope.authentication = Authentication;
    $scope.point = {};

    // Create new Point
    $scope.create = function() {
      var self = this;

      // Start validation.
      var errors = [];

      // Validate that a location has been supplied.
      if (!this.point.location) {
        errors.push('You must specify a location.');
      }

      // Validate custom fields.
      if (this.campaign.fields) {
        this.campaign.fields.forEach(function(field) {
          if (field.required) {
            if (self.point.fields === undefined || self.point.fields[field.name] === undefined || self.point.fields[field.name] === '') {
              errors.push('"' + field.name + '" is a required field.');
            }
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
        location: [this.point.location.lng, this.point.location.lat],
        data: this.point.fields
      });

      // Redirect after save
      point.$save(function(response) {
        $location.path('points/create');

        // Reset the form
        $scope.campaign = null;
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
      $scope.points = Points.query();
    };

    // Find existing Point
    $scope.findOne = function() {
      $scope.point = Points.get({
        pointId: $stateParams.pointId
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
