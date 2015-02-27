'use strict';

// Points controller
angular.module('points').controller('PointsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Points', 'Campaigns', 
  function($scope, $stateParams, $location, Authentication, Points, Campaigns) {
    $scope.authentication = Authentication;
    $scope.fields = {};
    
    // This will be inherited and altered by MapController.
    $scope.marker = {};

    // Create new Point
    $scope.create = function() {
      var self = this;
      
      // Start validation.
      var errors = [];
      
      // Validate that a location has been supplied.
      if (this.marker.lat === undefined) {
        errors.push("You must specify a location.");
      }
      
      // Validate custom fields.
      this.campaign.fields.forEach(function(field) {
        console.dir(field);
        if (field.required) {
          if (self.fields[field.name] === undefined || self.fields[field.name] === "") {
            errors.push("'" + field.name + "' is a required field.");
          }
        }
      });
      
      // Finish validation
      if (errors.length > 0) {
          $scope.errors = errors;
          return;
      }
      
      // Create new Point object
      var point = new Points ({
        campaign: this.campaign._id,
        location: this.marker.array,
        data: this.fields
      });

      // Redirect after save
      point.$save(function(response) {
        $location.path('points/' + response._id);

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
    
    // Find a list of Campaigns
    $scope.findCampaigns = function() {
      $scope.campaigns = Campaigns.query();
    };
  }
]);
