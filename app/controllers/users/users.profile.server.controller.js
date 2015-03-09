'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
  // Init Variables
  var user = req.user;
  var message = null;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // There are other fields of which we don't allow direct modification.
  delete req.body.memberships;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Join a campaign.
 */
exports.joinCampaign = function(req, res) {
  var user = req.user;
  var profile = req.profile;
  var campaign = req.campaign;
  /*
   * Only campaign owners can join other users to a campaign.
   * If the campaign is private, users cannot join themselves.
   * Otherwise go ahead!
   */
  if (profile && !campaign.user._id.equals(user._id)) {
    return res.status(400).send({
      message: 'You are not authorized to add users to this campaign.'
    });
  } else if (campaign.private) {
    return res.status(400).send({
      message: 'Private campaigns cannot be joined without an invitation.'
    });
  } else {
    profile = profile || user;
    profile.joinCampaign(campaign, function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(user);
      }
    });
  }
};

/**
 * Leave a campaign.
 */
exports.leaveCampaign = function(req, res) {
  var user = req.user;
  var campaign = req.campaign;
  if (campaign.user._id.equals(user._id)) {
    return res.status(400).send({
      message: 'You cannot leave your own campaign.'
    });
  } else {
    user.leaveCampaign(campaign, function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(user);
      }
    });
  }
};

/**
 * Send User
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};
