'use strict';

//Campaigns service used to communicate Campaigns REST endpoints
angular.module('campaigns').factory('Campaigns', ['$resource',
	function($resource) {
		return $resource('campaigns/:campaignId', { campaignId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);