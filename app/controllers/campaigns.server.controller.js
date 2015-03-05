'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Campaign = mongoose.model('Campaign'),
  User = mongoose.model('User'),
  _ = require('lodash'),
  async = require('async');

/**
 * Create a Campaign
 */
exports.create = function(req, res) {
  var campaign = new Campaign(req.body);
  campaign.user = req.user;

  // Create the campaign and make creator "join" it.
  async.parallel({
    campaign: function(done) {
      campaign.save(function(err, result) {
        done(err, result);
      });
    },
    user: function(done) {
      req.user.joinCampaign(campaign, function(err, result) {
        done(err, result);
      });
    }
  }, function(err, results) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Return the Campaign object.
      res.jsonp(results.campaign);
    }
  });

};

/**
 * Show the current Campaign
 */
exports.read = function(req, res) {
  res.jsonp(req.campaign);
};

/**
 * Update a Campaign
 */
exports.update = function(req, res) {
  var campaign = req.campaign ;

  campaign = _.extend(campaign , req.body);

  campaign.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaign);
    }
  });
};

/**
 * Delete an Campaign.
 *
 * Also unjoins all joined Users.
 */
exports.delete = function(req, res) {
  var campaign = req.campaign ;

  // Start an object of tasks to be carried out.
  var tasks = {};

  // Delete the campaign.
  tasks.campaign = function(done) {
    campaign.remove(function(err, result) {
      done(err, result);
    });
  };

  User.findUsersInCampaign(campaign, function(err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Add task to leave every joined user from the group.
      users.forEach(function(user) {
        tasks[user._id] = function(done) {
          user.leaveCampaign(campaign, function(err, result) {
            done(err, result);
          });
        };
      });

      // Carry out all the tasks in parallel.
      async.parallel(tasks, function(err, results) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(results.campaign);
        }
      });
    }
  });

};

/**
 * List of Campaigns
 */
exports.list = function(req, res) {
  var query = Campaign.find();

  /**
   * We may want to only return Campaigns of which the current user is
   * a member.
   *
   * If we are not getting user's own campaigns, we only want publically
   * available Campaigns.
   */
  if (req.query.mine) {
    query.where({
      '_id': {
        '$in': req.user.memberships
      }
    });
  } else {
    query.where({
      'private': false
    });
  }

  /**
   * Unless we are explicitly including closed campaigns, we want to
   * limit the results to currently open campaigns, or campaigns with
   * no time limitation.
   */
  if (!req.query.includeClosed) {
    var now = new Date();
    query.or([
      {
        'duration.start': {
          $lt: now
        },
        'duration.end': {
          $gt: now
        }
      },
      {
        'duration.start': null,
        'duration.end': null
      }
    ]);
  }

  query.sort('-created').populate('user', 'displayName').exec(function(err, campaigns) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaigns);
    }
  });
};

/**
 * Campaign middleware
 */
exports.campaignByID = function(req, res, next, id) {
  Campaign.findById(id).populate('user', 'displayName').exec(function(err, campaign) {
    if (err) return next(err);
    if (! campaign) return next(new Error('Failed to load Campaign ' + id));
    req.campaign = campaign ;
    next();
  });
};

/**
 * Campaign authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.campaign.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};
