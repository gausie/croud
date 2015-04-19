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
