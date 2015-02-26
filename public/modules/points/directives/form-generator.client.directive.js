'use strict';

angular.module('points').directive('formGenerator', [
	function() {
		return {
			templateUrl: "modules/points/views/form-generator.client.view.html",
			restrict: 'E',
      scope: {
        schema: '=',
        results: '='
      }
		};
	}
]);
