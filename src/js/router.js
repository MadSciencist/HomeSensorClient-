app.config(function ($routeProvider, $locationProvider, constants) {
    $locationProvider.hashPrefix('');
    console.log();
    $routeProvider
        .when("/", {
            templateUrl: "charts.html",
            controller: "ChartsController",
            auth: true
        })
        .when("/charts", {
            templateUrl: "charts.html",
            controller: "ChartsController",
            pageTitle: constants.dict[constants.lang.pl].pageTitle.sensors,
            auth: true
        })
        .when("/control", {
            templateUrl: "control.html",
            controller: "NodesController",
            pageTitle: constants.dict[constants.lang.pl].pageTitle.control,
            auth: true
        })
        .when("/nodes", {
            templateUrl: "nodes.html",
            controller: "NodesController",
            pageTitle: constants.dict[constants.lang.pl].pageTitle.nodes,
            auth: true
        })
        .when("/users", {
            templateUrl: "users.html",
            controller: "UsersController",
            pageTitle: constants.dict[2].pageTitle.users,
            auth: true
        })
        .when("/my-profile", {
            templateUrl: "user.html",
            controller: "UserController",
            pageTitle: constants.dict[2].pageTitle.myProfile,
            auth: true
        })
        .when("/login", {
            templateUrl: "login.html",
            controller: "LoginController",
            pageTitle: constants.dict[2].pageTitle.login,
            auth: false
        })
        .when('not-found', {
            templateUrl: 'not-found.html',
            pageTitle: constants.dict[2].pageTitle.default,
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
            $rootScope.pageTitle = constants[1].pageTitle.default,
            $location.path('not-found');
            return;
        } else {
            $rootScope.pageTitle = nextRoute.pageTitle;
            if (nextRoute.auth) {
                const tokenValidTo = $window.localStorage.getItem('validTo');
                const tokenValidToObject = new Date(tokenValidTo);
                if (new Date().getTime() > tokenValidToObject.getTime()) { //token is no longer valid
                    if (tokenValidTo != null) {
                        $rootScope.badAuthentication = true;
                        $rootScope.badAuthenticationMessage = 'asd';
                    }
                    $location.path('/login');
                }
            }
        }
    });
});