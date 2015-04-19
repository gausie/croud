// Add select option to field.
$scope.addOption = function(field) {
  // Create fields array if one doesn't exist.
  if ($scope.campaign.fields[field].options === undefined) {
    $scope.campaign.fields[field].options = [];
  }

  // Add a new default blank field
  $scope.campaign.fields[field].options.push({
    name: '',
    icon: null
  });
};

// Remove field from Campaign.
$scope.removeOption = function(field, index) {
  $scope.campaign.fields[field].options.splice(index, 1);
};

// Add field to Campaign.
$scope.addField = function() {
  // Create fields array if one doesn't exist.
  if ($scope.campaign.fields === undefined) {
    $scope.campaign.fields = [];
  }

  // Add a new default blank field
  $scope.campaign.fields.push({
    name: '',
    type: null,
    required: false
  });
};

// Remove field from Campaign.
$scope.removeField = function(index) {
  $scope.campaign.fields.splice(index, 1);
};