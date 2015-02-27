'use strict';

(function() {
  // Campaigns Controller Spec
  describe('Campaigns Controller Tests', function() {
    // Initialize global variables
    var CampaignsController,
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

      // Initialize the Campaigns controller.
      CampaignsController = $controller('CampaignsController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one Campaign object fetched from XHR', inject(function(Campaigns) {
      // Create sample Campaign using the Campaigns service
      var sampleCampaign = new Campaigns({
        name: 'New Campaign'
      });

      // Create a sample Campaigns array that includes the new Campaign
      var sampleCampaigns = [sampleCampaign];

      // Set GET response
      $httpBackend.expectGET('campaigns').respond(sampleCampaigns);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.campaigns).toEqualData(sampleCampaigns);
    }));

    it('$scope.findOne() should create an array with one Campaign object fetched from XHR using a campaignId URL parameter', inject(function(Campaigns) {
      // Define a sample Campaign object
      var sampleCampaign = new Campaigns({
        name: 'New Campaign'
      });

      // Set the URL parameter
      $stateParams.campaignId = '525a8422f6d0f87f0e407a33';

      // Set GET response
      $httpBackend.expectGET(/campaigns\/([0-9a-fA-F]{24})$/).respond(sampleCampaign);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.campaign).toEqualData(sampleCampaign);
    }));

    it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Campaigns) {
      // Create a sample Campaign object
      var sampleCampaignPostData = new Campaigns({
        name: 'New Campaign'
      });

      // Create a sample Campaign response
      var sampleCampaignResponse = new Campaigns({
        _id: '525cf20451979dea2c000001',
        name: 'New Campaign'
      });

      // Fixture mock form input values
      scope.name = 'New Campaign';

      // Set POST response
      $httpBackend.expectPOST('campaigns', sampleCampaignPostData).respond(sampleCampaignResponse);

      // Run controller functionality
      scope.create();
      $httpBackend.flush();

      // Test form inputs are reset
      expect(scope.name).toEqual('');

      // Test URL redirection after the Campaign was created
      expect($location.path()).toBe('/campaigns/' + sampleCampaignResponse._id);
    }));

    it('$scope.update() should update a valid Campaign', inject(function(Campaigns) {
      // Define a sample Campaign put data
      var sampleCampaignPutData = new Campaigns({
        _id: '525cf20451979dea2c000001',
        name: 'New Campaign'
      });

      // Mock Campaign in scope
      scope.campaign = sampleCampaignPutData;

      // Set PUT response
      $httpBackend.expectPUT(/campaigns\/([0-9a-fA-F]{24})$/).respond();

      // Run controller functionality
      scope.update();
      $httpBackend.flush();

      // Test URL location to new object
      expect($location.path()).toBe('/campaigns/' + sampleCampaignPutData._id);
    }));

    it('$scope.remove() should send a DELETE request with a valid campaignId and remove the Campaign from the scope', inject(function(Campaigns) {
      // Create new Campaign object
      var sampleCampaign = new Campaigns({
        _id: '525a8422f6d0f87f0e407a33'
      });

      // Create new Campaigns array and include the Campaign
      scope.campaigns = [sampleCampaign];

      // Set expected DELETE response
      $httpBackend.expectDELETE(/campaigns\/([0-9a-fA-F]{24})$/).respond(204);

      // Run controller functionality
      scope.remove(sampleCampaign);
      $httpBackend.flush();

      // Test array after successful delete
      expect(scope.campaigns.length).toBe(0);
    }));
  });
}());