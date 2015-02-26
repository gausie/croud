'use strict';

//Points service used to communicate Points REST endpoints
angular.module('points').factory('Points', ['$resource',
	function($resource) {
		return $resource('points/:pointId', { pointId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);