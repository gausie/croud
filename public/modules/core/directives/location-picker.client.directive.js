'use strict';

angular.module('core').directive('locationPicker', [
  function() {
    return {
      templateUrl: 'modules/core/views/location-picker.client.view.html',
      restrict: 'E',
      scope: {
        defaultCenter: '&?',
        location: '='
      },
      controller: function ($scope, leafletData) {
        // The inbuilt default center is the center of the world according
        // to the somewhat racist Western understanding of the world map. 
        $scope._defaultCenter = function() {
          return {
            lat: 40.87,
            lng: 34.57,
            zoom: 1
          };
        };
        
        // Set initial values.
        $scope.events = {};
        $scope.center = $scope._defaultCenter();
        
        // Reset the map.
        $scope.resetMap = function() {
          leafletData.getMap().then(function(map) {
            map.invalidateSize();
          });
          $scope.center = $scope.defaultCenter();
          $scope.markers = [];
          $scope.location = undefined;
        };
        
        // Move or create marker at given coords.
        $scope.moveMarker = function(coords) {
          var marker = {
            lat: coords.lat,
            lng: coords.lng,
            array: [coords.lng, coords.lat]
          };
          
          // Either create or update a single marker.
          if ($scope.markers.length < 1) {
            $scope.markers = [marker];
          } else {
            $scope.markers[0] = marker;
          }
        
          $scope.location = marker;
        };
        
        // Add marker to geolocation.
        $scope.dropPin = function() {
          var self = this;
          leafletData.getMap().then(function(map) {
            map.locate({ setView: true }).on('locationfound', function(e) {
              $scope.moveMarker(e.latlng);
            });
          });
        };
      },
      link: function postLink (scope, element, attrs) {
        // If user does not specify a default center, pick a 
        // default default center.
        if (!attrs.defaultCenter) {
          scope.defaultCenter = scope._defaultCenter;
        }
  
        scope.resetMap(); 
    
        // Set map marker on click.
        scope.$on('leafletDirectiveMap.click', function(event, args){
          var leafEvent = args.leafletEvent;
          scope.moveMarker(leafEvent.latlng);
        });
  
        scope.$on('resetMap', scope.resetMap);      
      }
    };
  }
]);
