'use strict';

//Setting up route
angular.module('campaigns').config(['$stateProvider',
	function($stateProvider) {
		// Campaigns state routing
		$stateProvider.
		state('listCampaigns', {
			url: '/campaigns',
			templateUrl: 'modules/campaigns/views/list-campaigns.client.view.html'
		}).
		state('createCampaign', {
			url: '/campaigns/create',
			templateUrl: 'modules/campaigns/views/create-campaign.client.view.html'
		}).
		state('viewCampaign', {
			url: '/campaigns/:campaignId',
			templateUrl: 'modules/campaigns/views/view-campaign.client.view.html'
		}).
		state('editCampaign', {
			url: '/campaigns/:campaignId/edit',
			templateUrl: 'modules/campaigns/views/edit-campaign.client.view.html'
		});
	}
]);