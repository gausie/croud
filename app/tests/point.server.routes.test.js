'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Point = mongoose.model('Point'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, point;

/**
 * Point routes tests
 */
describe('Point CRUD tests', function() {
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

		// Save a user to the test db and create new Point
		user.save(function() {
			point = {
				name: 'Point Name'
			};

			done();
		});
	});

	it('should be able to save Point instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Point
				agent.post('/points')
					.send(point)
					.expect(200)
					.end(function(pointSaveErr, pointSaveRes) {
						// Handle Point save error
						if (pointSaveErr) done(pointSaveErr);

						// Get a list of Points
						agent.get('/points')
							.end(function(pointsGetErr, pointsGetRes) {
								// Handle Point save error
								if (pointsGetErr) done(pointsGetErr);

								// Get Points list
								var points = pointsGetRes.body;

								// Set assertions
								(points[0].user._id).should.equal(userId);
								(points[0].name).should.match('Point Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Point instance if not logged in', function(done) {
		agent.post('/points')
			.send(point)
			.expect(401)
			.end(function(pointSaveErr, pointSaveRes) {
				// Call the assertion callback
				done(pointSaveErr);
			});
	});

	it('should not be able to save Point instance if no name is provided', function(done) {
		// Invalidate name field
		point.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Point
				agent.post('/points')
					.send(point)
					.expect(400)
					.end(function(pointSaveErr, pointSaveRes) {
						// Set message assertion
						(pointSaveRes.body.message).should.match('Please fill Point name');
						
						// Handle Point save error
						done(pointSaveErr);
					});
			});
	});

	it('should be able to update Point instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Point
				agent.post('/points')
					.send(point)
					.expect(200)
					.end(function(pointSaveErr, pointSaveRes) {
						// Handle Point save error
						if (pointSaveErr) done(pointSaveErr);

						// Update Point name
						point.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Point
						agent.put('/points/' + pointSaveRes.body._id)
							.send(point)
							.expect(200)
							.end(function(pointUpdateErr, pointUpdateRes) {
								// Handle Point update error
								if (pointUpdateErr) done(pointUpdateErr);

								// Set assertions
								(pointUpdateRes.body._id).should.equal(pointSaveRes.body._id);
								(pointUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Points if not signed in', function(done) {
		// Create new Point model instance
		var pointObj = new Point(point);

		// Save the Point
		pointObj.save(function() {
			// Request Points
			request(app).get('/points')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Point if not signed in', function(done) {
		// Create new Point model instance
		var pointObj = new Point(point);

		// Save the Point
		pointObj.save(function() {
			request(app).get('/points/' + pointObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', point.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Point instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Point
				agent.post('/points')
					.send(point)
					.expect(200)
					.end(function(pointSaveErr, pointSaveRes) {
						// Handle Point save error
						if (pointSaveErr) done(pointSaveErr);

						// Delete existing Point
						agent.delete('/points/' + pointSaveRes.body._id)
							.send(point)
							.expect(200)
							.end(function(pointDeleteErr, pointDeleteRes) {
								// Handle Point error error
								if (pointDeleteErr) done(pointDeleteErr);

								// Set assertions
								(pointDeleteRes.body._id).should.equal(pointSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Point instance if not signed in', function(done) {
		// Set Point user 
		point.user = user;

		// Create new Point model instance
		var pointObj = new Point(point);

		// Save the Point
		pointObj.save(function() {
			// Try deleting Point
			request(app).delete('/points/' + pointObj._id)
			.expect(401)
			.end(function(pointDeleteErr, pointDeleteRes) {
				// Set message assertion
				(pointDeleteRes.body.message).should.match('User is not logged in');

				// Handle Point error error
				done(pointDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Point.remove().exec();
		done();
	});
});