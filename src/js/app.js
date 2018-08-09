var app = angular.module("smartHomeApp", [
    'ngRoute'
]);

app.run(function ($rootScope, constants) {
    $rootScope.constants = constants;
});