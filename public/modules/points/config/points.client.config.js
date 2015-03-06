'use strict';

// Configuring the Points module
angular.module('points').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', '<i class="fa fa-map-marker"></i> Add a point!', 'createPoint', 'button', undefined, undefined, undefined, -1);
  }
]);
