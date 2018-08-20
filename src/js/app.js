var app = angular.module("smartHomeApp", [
    'ngRoute',
    'ngMaterial'
]);

app.run(function ($rootScope, constants) {
    $rootScope.constants = constants;
});