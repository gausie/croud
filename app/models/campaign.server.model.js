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
  duration: {
    start: {
      type: Date
    },
    end: {
      type: Date
    }
  },
  private: {
    type: Boolean,
    default: false
  },
  approvalRequired: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
}, {
  toJSON: {
    virtuals: true
  }
});

CampaignSchema.virtual('duration.open').get(function() {
  var now = new Date();
  var d = this.duration;
  if (!d.start || !d.end) {
    // No start or end defined.
    return true;
  } else if(d.start < now && d.end > now) {
    // Within start and end.
    return true;
  } else {
    // Not within start and end.
    return false;
  }
});

CampaignSchema.pre('save', function (next) {
  this.locationArray = [this.location.lng, this.location.lat];
  next();
});

mongoose.model('Campaign', CampaignSchema);
