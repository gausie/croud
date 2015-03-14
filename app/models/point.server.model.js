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
    lat: { type: Number },
    lng: { type: Number }
  },
  locationArray: {
    type: [Number],
    index: '2dsphere'
  },
  data: {
    type: Schema.Types.Mixed
  },
  approved: {
    type: Boolean,
    default: true
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

/**
 * Keep locationArray for geo queries
 */
PointSchema.pre('save', function (next) {
  this.locationArray = [this.location.lng, this.location.lat];
  next();
});

/**
 * Auto-set approved
 */
PointSchema.pre('save', function (next) {
  if (this.isNew) {
    console.log(this.campaign);
  }
});

mongoose.model('Point', PointSchema);
