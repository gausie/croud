'use strict';

angular.module('points').filter('sanitizeFilename', [
	function() {
		return function(input) {
			/**
			 * Copied from the sanitize-filename npm package.
			 */
			var illegalRe = /[\/\?<>\\:\*\|":]/g;
			var controlRe = /[\x00-\x1f\x80-\x9f]/g;
			var reservedRe = /^\.+$/;
			var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

			function sanitize(input, replacement) {
			  return input
			    .replace(illegalRe, replacement)
			    .replace(controlRe, replacement)
			    .replace(reservedRe, replacement)
			    .replace(windowsReservedRe, replacement);
			}
			return sanitize(input, '');
		};
	}
]);