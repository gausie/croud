'use strict';

angular.module('core').filter('mongogeo', [
	function() {
		return function(input, direction) {
      if (!input) {
        return undefined;
      } else if (direction === 'in') {
        return [input.lng, input.lat];
      } else {
        return {
          lng: input[0],
          lat: input[1],
          zoom: 8
        };
      }
		};
	}
]);
