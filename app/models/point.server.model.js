'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Campaign = mongoose.model('Campaign');

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
  var point = this;
  if (this.isNew) {
    Campaign.findById(this.campaign, function (err, campaign) {
      point.approved = !campaign.approvalRequired;
      next();
    });
  }
});

mongoose.model('Point', PointSchema);
