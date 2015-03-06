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
  var query = Point.find();

  // Filter Points by campaign, else populate with the campaign details.
  if (req.query.campaign) {
    query.where('campaign').equals(req.query.campaign);
  } else {
    query.populate('campaign');
  }

  // Filter points by user
  if (req.query.user) {
    query.where('user').equals(req.query.user);
  }

  //  Only return Points within a certain bounds if needed.
  if (req.query.bounds) {
    var b = req.query.bounds.split(',');
    query.where('locationArray').within().box(b.slice(0,2), b.slice(2,4));
  }

  query.sort('-created').populate('user', 'displayName').exec(function(err, points) {
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
  Point.findById(id).populate('user', 'displayName').populate('campaign').exec(function(err, point) {
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
