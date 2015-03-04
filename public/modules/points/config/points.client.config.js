'use strict';

// Configuring the Points module
angular.module('points').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', '<i class="fa fa-map-marker"></i> Add a point!', 'points/create', 'button', undefined, undefined, undefined, -1);
    Menus.addSubMenuItem('topbar', 'points', 'View Points', 'points');
    Menus.addSubMenuItem('topbar', 'points', 'Create Point', 'points/create');
  }
]);
