'use strict';

// Map controller
angular.module('points').controller('MapController', ['$scope', 'leafletData', 
	function($scope, leafletData) {
    // Default settings for Leaflet.js map.
    var defaultCenter = {
      lat: 40.87,
      lng: 34.57,
      zoom: 1
    };
    
    var resetMap = function() {
      leafletData.getMap().then(function(map) {
        map.invalidateSize();
      });
      $scope.center = defaultCenter;
      $scope.events = {};
      $scope.markers = [];
      // This needs to be emptied so the reference to parent is left 
      // intact.
      for (var i in $scope.marker) delete $scope.marker[i];
    }
    
    resetMap();
    
    // Move or create marker at given coords.
    var moveMarker = function(coords) {
      var marker = {
        lat: coords.lat,
        lng: coords.lng,
        array: [coords.lat, coords.lng]
      };
      
      // Either create or update a single marker.
      if ($scope.markers.length < 1) {
        $scope.markers = [marker];
      } else {
        $scope.markers[0] = marker;
      }
    
      angular.extend($scope.marker, marker);
    };
    
    $scope.$on('resetMap', resetMap);
    
    // Set map marker on click.
    $scope.$on('leafletDirectiveMap.click', function(event, args){
      var leafEvent = args.leafletEvent;
      moveMarker(leafEvent.latlng);
    });
    
    // Add marker to geolocation.
    $scope.dropPin = function() {
      var self = this;
      leafletData.getMap().then(function(map) {
        map.locate({ setView: true }).on('locationfound', function(e) {
          moveMarker(e.latlng);
        });
      });
    };
	}
]);
