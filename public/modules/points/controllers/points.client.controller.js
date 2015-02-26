'use strict';

// Points controller
angular.module('points').controller('PointsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Points', 'Campaigns',
	function($scope, $stateParams, $location, Authentication, Points, Campaigns) {
		$scope.authentication = Authentication;

    $scope.fields = {};

    // Default settings for Leaflet.js map.
    angular.extend($scope, {
      center: {
        lat: 51,
        lng: 0,
        zoom: 8
      },
      events: {},
      markers: {}
    });
    
    // Set map marker on click.
    $scope.$on('leafletDirectiveMap.click', function(event, args){
      var leafEvent = args.leafletEvent;
      
      var marker = {
        lat: leafEvent.latlng.lat,
        lng: leafEvent.latlng.lng
      };
      
      // Either create or update a single marker.
      if ($scope.markers.length < 1) {
        $scope.markers.push(marker);
      } else {
        $scope.markers[0] = marker;
      }
    });

		// Create new Point
		$scope.create = function() {
			// Create new Point object
      var location = this.markers[0];
			var point = new Points ({
        campaign: this.campaign,
				location: [location.lat, location.lng]
			});

			// Redirect after save
			point.$save(function(response) {
				$location.path('points/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

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
