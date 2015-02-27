'use strict';

// Configuring the Points module
angular.module('points').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Points', 'points', 'dropdown', '/points(/create)?');
    Menus.addSubMenuItem('topbar', 'points', 'View Points', 'points');
		Menus.addSubMenuItem('topbar', 'points', 'Create Point', 'points/create');
	}
]);
