app.config(function ($routeProvider, $locationProvider, constants) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when("/", {
            templateUrl: "charts.html",
            controller: "ChartsController",
            auth: true
        })
        .when("/charts", {
            templateUrl: "charts.html",
            controller: "ChartsController",
            pageTitle: constants.dict[0].pageTitle.sensors,
            auth: true
        })
        .when("/control", {
            templateUrl: "control.html",
            controller: "NodesController",
            pageTitle: constants.dict[0].pageTitle.control,
            auth: true
        })
        .when("/stream", {
            templateUrl: "stream.html",
            controller: "StreamController",
            pageTitle: "Podgląd kamer",
            auth: true
        })
        .when("/nodes", {
            templateUrl: "nodes.html",
            controller: "NodesController",
            pageTitle: constants.dict[0].pageTitle.nodes,
            auth: true
        })
        .when("/users", {
            templateUrl: "users.html",
            controller: "UsersController",
            pageTitle: constants.dict[0].pageTitle.users,
            auth: true
        })
        .when("/new-device-type", {
            templateUrl: "manage-device-type.html",
            controller: "ManageDeviceTypeController",
            pageTitle: "Zarządzaj dostępnymi typami urządzeń",
            auth: true
        })
        .when("/manage-streams", {
            templateUrl: "manage-streams.html",
            controller: "ManageStreamsController",
            pageTitle: "Zarządzaj dostępnymi streamami",
            auth: true
        })
        .when("/my-profile", {
            templateUrl: "user.html",
            controller: "UserController",
            pageTitle: constants.dict[0].pageTitle.myProfile,
            auth: true
        })
        .when("/login", {
            templateUrl: "login.html",
            controller: "LoginController",
            pageTitle: constants.dict[0].pageTitle.login,
            auth: false
        })
        .when('not-found', {
            templateUrl: 'not-found.html',
            pageTitle: constants.dict[0].pageTitle.default,
            auth: false
        })
        .otherwise({
            templateUrl: "not-found.html",
            auth: false
        });
});

app.run(function ($rootScope, $location, $window, constants) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        const nextRoute = next.$$route;
        if (nextRoute === undefined) {
            $rootScope.pageTitle = constants.dict[0].pageTitle.default;
            $location.path('not-found');
        } else {
            $rootScope.pageTitle = nextRoute.pageTitle;
            if (nextRoute.auth) {
                const tokenValidTo = $window.localStorage.getItem('validTo');
                const tokenValidToObject = new Date(tokenValidTo);
                if (new Date().getTime() > tokenValidToObject.getTime()) { //token is no longer valid
                    if (tokenValidTo != null) {
                        $rootScope.badAuthentication = true;
                        $rootScope.badAuthenticationMessage = constants.dict[0].forms.login.badAuthenticationMessage;
                    }
                    $window.localStorage.clear();
                    $location.path('/login');
                }
            }
        }
    });
});