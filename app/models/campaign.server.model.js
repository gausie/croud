'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Campaign Schema
 */
var CampaignSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Campaign name',
    trim: true
  },
  location: {
    lng: { type: Number },
    lat: { type: Number },
    zoom: { type: Number }
  },
  locationArray: {
    type: [Number],
    index: '2dsphere'
  },
  fields: {
    type: Schema.Types.Mixed
  },
  start: {
    type: Date
  },
  end: {
    type: Date
  },
  approvalRequired: {
    type: Boolean
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

CampaignSchema.pre('save', function (next) {
  this.locationArray = [this.location.lng, this.location.lat];
  next();
});

mongoose.model('Campaign', CampaignSchema);
