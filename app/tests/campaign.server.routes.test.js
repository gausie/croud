'use strict';

var should = require('should'),
  request = require('supertest'),
  app = require('../../server'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Campaign = mongoose.model('Campaign'),
  agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, campaign;

/**
 * Campaign routes tests
 */
describe('Campaign CRUD tests', function() {
  beforeEach(function(done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'password'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Campaign
    user.save(function() {
      campaign = {
        name: 'Campaign Name'
      };

      done();
    });
  });

  it('should be able to save Campaign instance if logged in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new Campaign
        agent.post('/campaigns')
          .send(campaign)
          .expect(200)
          .end(function(campaignSaveErr, campaignSaveRes) {
            // Handle Campaign save error
            if (campaignSaveErr) done(campaignSaveErr);

            // Get a list of Campaigns
            agent.get('/campaigns')
              .end(function(campaignsGetErr, campaignsGetRes) {
                // Handle Campaign save error
                if (campaignsGetErr) done(campaignsGetErr);

                // Get Campaigns list
                var campaigns = campaignsGetRes.body;

                // Set assertions
                (campaigns[0].user._id).should.equal(userId);
                (campaigns[0].name).should.match('Campaign Name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save Campaign instance if not logged in', function(done) {
    agent.post('/campaigns')
      .send(campaign)
      .expect(401)
      .end(function(campaignSaveErr, campaignSaveRes) {
        // Call the assertion callback
        done(campaignSaveErr);
      });
  });

  it('should not be able to save Campaign instance if no name is provided', function(done) {
    // Invalidate name field
    campaign.name = '';

    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new Campaign
        agent.post('/campaigns')
          .send(campaign)
          .expect(400)
          .end(function(campaignSaveErr, campaignSaveRes) {
            // Set message assertion
            (campaignSaveRes.body.message).should.match('Please fill Campaign name');

            // Handle Campaign save error
            done(campaignSaveErr);
          });
      });
  });

  it('should be able to update Campaign instance if signed in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new Campaign
        agent.post('/campaigns')
          .send(campaign)
          .expect(200)
          .end(function(campaignSaveErr, campaignSaveRes) {
            // Handle Campaign save error
            if (campaignSaveErr) done(campaignSaveErr);

            // Update Campaign name
            campaign.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update existing Campaign
            agent.put('/campaigns/' + campaignSaveRes.body._id)
              .send(campaign)
              .expect(200)
              .end(function(campaignUpdateErr, campaignUpdateRes) {
                // Handle Campaign update error
                if (campaignUpdateErr) done(campaignUpdateErr);

                // Set assertions
                (campaignUpdateRes.body._id).should.equal(campaignSaveRes.body._id);
                (campaignUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Campaigns if not signed in', function(done) {
    // Create new Campaign model instance
    var campaignObj = new Campaign(campaign);

    // Save the Campaign
    campaignObj.save(function() {
      // Request Campaigns
      request(app).get('/campaigns')
        .end(function(req, res) {
          // Set assertion
          res.body.should.be.an.Array.with.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });


  it('should be able to get a single Campaign if not signed in', function(done) {
    // Create new Campaign model instance
    var campaignObj = new Campaign(campaign);

    // Save the Campaign
    campaignObj.save(function() {
      request(app).get('/campaigns/' + campaignObj._id)
        .end(function(req, res) {
          // Set assertion
          res.body.should.be.an.Object.with.property('name', campaign.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to delete Campaign instance if signed in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new Campaign
        agent.post('/campaigns')
          .send(campaign)
          .expect(200)
          .end(function(campaignSaveErr, campaignSaveRes) {
            // Handle Campaign save error
            if (campaignSaveErr) done(campaignSaveErr);

            // Delete existing Campaign
            agent.delete('/campaigns/' + campaignSaveRes.body._id)
              .send(campaign)
              .expect(200)
              .end(function(campaignDeleteErr, campaignDeleteRes) {
                // Handle Campaign error error
                if (campaignDeleteErr) done(campaignDeleteErr);

                // Set assertions
                (campaignDeleteRes.body._id).should.equal(campaignSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete Campaign instance if not signed in', function(done) {
    // Set Campaign user
    campaign.user = user;

    // Create new Campaign model instance
    var campaignObj = new Campaign(campaign);

    // Save the Campaign
    campaignObj.save(function() {
      // Try deleting Campaign
      request(app).delete('/campaigns/' + campaignObj._id)
      .expect(401)
      .end(function(campaignDeleteErr, campaignDeleteRes) {
        // Set message assertion
        (campaignDeleteRes.body.message).should.match('User is not logged in');

        // Handle Campaign error error
        done(campaignDeleteErr);
      });

    });
  });

  afterEach(function(done) {
    User.remove().exec();
    Campaign.remove().exec();
    done();
  });
});
