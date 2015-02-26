'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var points = require('../../app/controllers/points.server.controller');

	// Points Routes
	app.route('/points')
		.get(points.list)
		.post(users.requiresLogin, points.create);

	app.route('/points/:pointId')
		.get(points.read)
		.put(users.requiresLogin, points.hasAuthorization, points.update)
		.delete(users.requiresLogin, points.hasAuthorization, points.delete);

	// Finish by binding the Point middleware
	app.param('pointId', points.pointByID);
};
