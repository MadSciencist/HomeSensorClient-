var app = angular.module("smartHomeApp", ['ngRoute']);


app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "charts.html",
            controller: "ChartsController",
            auth: true
        })
        .when("/charts", {
            templateUrl: "charts.html",
            controller: "ChartsController",
            auth: true
        })
        .when("/control", {
            templateUrl: "control.html",
            controller: "NodesController",
            auth: true
        })
        .when("/nodes", {
            templateUrl: "nodes.html",
            controller: "NodesController",
            auth: true
        })
        .when("/users", {
            templateUrl: "users.html",
            controller: "UsersController",
            auth: true
        })
        .when("/my-profile", {
            templateUrl: "user.html",
            controller: "UserController",
            auth: true
        })
        .when("/login", {
            templateUrl: "login.html",
            controller: "LoginController"
        })
        .otherwise({
            templateUrl: "not-found.html"
        });
});

app.controller("RootController", function ($scope) {

    $scope.test = 'TEST';

});