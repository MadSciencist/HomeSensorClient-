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

app.run(function ($rootScope, $location, $window) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (next.$$route.auth) {
            const tokenValidTo = $window.localStorage.getItem('validTo');

            const tokenValidToObject = new Date(tokenValidTo);
            let currentTime = new Date();
            if (currentTime.getTime() > tokenValidToObject.getTime()) { //token is no longer valid

                if (tokenValidTo != null) {
                    $rootScope.badAuthentication = true;
                    $rootScope.badAuthenticationMessage = 'Twoja sesja wygasła. Zaloguj się ponownie.';
                }
                $location.path('/login');
            }
        }

    });
});