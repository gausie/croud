'use strict';

angular.module('core').directive('locationPicker', [
  function() {
    return {
      templateUrl: 'modules/core/views/location-picker.client.view.html',
      restrict: 'E',
      scope: {
        defaultCenter: '=?',
        location: '=',
        zoom: '=?'
      },
      controller: function ($scope, leafletData) {
        // The inbuilt default center is the center of the world according
        // to the somewhat racist Western understanding of the world map.
        $scope._defaultCenter = {
          lat: 40.87,
          lng: 34.57,
          zoom: 1
        };

        // If user does not specify a default center, pick a
        // default default center.
        if (!$scope.defaultCenter) {
          $scope.defaultCenter = $scope._defaultCenter;
        }

        if (!$scope.location) {
          //$scope.location = {};
        }

        // Set initial values.
        $scope.events = {};
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
          if ($scope.markers.length < 1) {
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
              $scope.location = {
                lng: e.longitude,
                lat: e.latitude,
                zoom: $scope.center.zoom
              };
            });
          });
        };

      },
      link: function postLink ($scope, element, attrs) {
        $scope.$watch('location', function (v) {
          if (v) {
            $scope.location.array = [v.lng, v.lat];
            $scope.moveMarker(v);
            $scope.center = v;
          } else {
            $scope.markers = [];
            $scope.center = $scope.defaultCenter;
          }
        }, true);

        // Set map marker on click.
        $scope.$on('leafletDirectiveMap.click', function(event, args){
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
        });

        $scope.resetMap();

        $scope.$on('resetMap', $scope.resetMap);
      }
    };
  }
]);
