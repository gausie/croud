'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Point Schema
 */
var PointSchema = new Schema({
  campaign: {
    type: Schema.ObjectId,
    ref: 'Campaign'
  },
  location: {
    type: [Number],
    index: '2d'
  },
  data: {
    type: Schema.Types.Mixed
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Point', PointSchema);
