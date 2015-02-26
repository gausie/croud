'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Point = mongoose.model('Point'),
	_ = require('lodash');

/**
 * Create a Point
 */
exports.create = function(req, res) {
	var point = new Point(req.body);
	point.user = req.user;

	point.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(point);
		}
	});
};

/**
 * Show the current Point
 */
exports.read = function(req, res) {
	res.jsonp(req.point);
};

/**
 * Update a Point
 */
exports.update = function(req, res) {
	var point = req.point ;

	point = _.extend(point , req.body);

	point.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(point);
		}
	});
};

/**
 * Delete an Point
 */
exports.delete = function(req, res) {
	var point = req.point ;

	point.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(point);
		}
	});
};

/**
 * List of Points
 */
exports.list = function(req, res) { 
	Point.find().sort('-created').populate('user', 'displayName').exec(function(err, points) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(points);
		}
	});
};

/**
 * Point middleware
 */
exports.pointByID = function(req, res, next, id) { 
	Point.findById(id).populate('user', 'displayName').exec(function(err, point) {
		if (err) return next(err);
		if (! point) return next(new Error('Failed to load Point ' + id));
		req.point = point ;
		next();
	});
};

/**
 * Point authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.point.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
