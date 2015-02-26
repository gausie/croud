'use strict';

(function() {
	// Points Controller Spec
	describe('Points Controller Tests', function() {
		// Initialize global variables
		var PointsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Points controller.
			PointsController = $controller('PointsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Point object fetched from XHR', inject(function(Points) {
			// Create sample Point using the Points service
			var samplePoint = new Points({
				name: 'New Point'
			});

			// Create a sample Points array that includes the new Point
			var samplePoints = [samplePoint];

			// Set GET response
			$httpBackend.expectGET('points').respond(samplePoints);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.points).toEqualData(samplePoints);
		}));

		it('$scope.findOne() should create an array with one Point object fetched from XHR using a pointId URL parameter', inject(function(Points) {
			// Define a sample Point object
			var samplePoint = new Points({
				name: 'New Point'
			});

			// Set the URL parameter
			$stateParams.pointId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/points\/([0-9a-fA-F]{24})$/).respond(samplePoint);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.point).toEqualData(samplePoint);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Points) {
			// Create a sample Point object
			var samplePointPostData = new Points({
				name: 'New Point'
			});

			// Create a sample Point response
			var samplePointResponse = new Points({
				_id: '525cf20451979dea2c000001',
				name: 'New Point'
			});

			// Fixture mock form input values
			scope.name = 'New Point';

			// Set POST response
			$httpBackend.expectPOST('points', samplePointPostData).respond(samplePointResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Point was created
			expect($location.path()).toBe('/points/' + samplePointResponse._id);
		}));

		it('$scope.update() should update a valid Point', inject(function(Points) {
			// Define a sample Point put data
			var samplePointPutData = new Points({
				_id: '525cf20451979dea2c000001',
				name: 'New Point'
			});

			// Mock Point in scope
			scope.point = samplePointPutData;

			// Set PUT response
			$httpBackend.expectPUT(/points\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/points/' + samplePointPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid pointId and remove the Point from the scope', inject(function(Points) {
			// Create new Point object
			var samplePoint = new Points({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Points array and include the Point
			scope.points = [samplePoint];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/points\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(samplePoint);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.points.length).toBe(0);
		}));
	});
}());