var app = angular.module("smartHomeApp", [
    'ngRoute',
    'ngMaterial',
    'ngMessages'
]);

app.run(function ($rootScope, constants) {
    $rootScope.constants = constants;
});