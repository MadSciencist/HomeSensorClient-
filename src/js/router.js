app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when("/", {
            templateUrl: "charts.html",
            controller: "ChartsController",
            auth: true,
            requiredRoles: ["Admin", "Manager", "Viewer"] //user should be in one of these groups
        })
        .when("/charts", {
            templateUrl: "charts.html",
            controller: "ChartsController",
            pageTitle: "Wykresy z danych wszystkich czujników",
            auth: true,
            requiredRoles: ["Admin", "Manager", "Viewer"]
        })
        .when("/control", {
            templateUrl: "control.html",
            controller: "ManageNodesController",
            pageTitle: "Steruj swoimi urządzeniami",
            auth: true,
            requiredRoles: ["Admin", "Manager", "Viewer"]
        })
        .when("/stream", {
            templateUrl: "stream.html",
            controller: "StreamController",
            pageTitle: "Podgląd kamer",
            auth: true,
            requiredRoles: ["Admin", "Manager", "Viewer"]
        })
        .when("/manage-nodes", {
            templateUrl: "manage-nodes.html",
            controller: "ManageNodesController",
            pageTitle: "'Zarządzaj swoimi urządzeniami",
            auth: true,
            requiredRoles: ["Admin", "Manager"]
        })
        .when("/manage-users", {
            templateUrl: "manage-users.html",
            controller: "UsersController",
            pageTitle: "Zarządzaj użytkownikami systemu",
            auth: true,
            requiredRoles: ["Admin", "Manager"]
        })
        .when("/new-device-type", {
            templateUrl: "manage-device-type.html",
            controller: "ManageDeviceTypeController",
            pageTitle: "Zarządzaj dostępnymi typami urządzeń",
            auth: true,
            requiredRoles: ["Admin", "Manager"]
        })
        .when("/manage-streams", {
            templateUrl: "manage-streams.html",
            controller: "ManageStreamsController",
            pageTitle: "Zarządzaj dostępnymi streamami",
            auth: true,
            requiredRoles: ["Admin", "Manager"]
        })
        .when("/my-profile", {
            templateUrl: "user.html",
            controller: "UserController",
            pageTitle: "Mój profil",
            auth: true
        })
        .when("/login", {
            templateUrl: "login.html",
            controller: "LoginController",
            pageTitle: "Zaloguj się",
            auth: false
        })
        .when('/not-found', {
            templateUrl: 'not-found.html',
            pageTitle: "Nie znaleziono",
            auth: false
        })
        .when('/not-authorized', {
            templateUrl: 'not-authorized.html',
            pageTitle: "Nie masz wystarczających uprawnień",
            auth: false
        })
        .otherwise({
            templateUrl: "not-found.html",
            auth: false
        });
});

app.run(function ($rootScope, $location, $window) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        const nextRoute = next.$$route;
        if (nextRoute === undefined) {
            $rootScope.pageTitle = "Nie znaleziono";
            $location.path('/not-found');
        } else {
            $rootScope.pageTitle = nextRoute.pageTitle;
            if (nextRoute.auth) {
                /* next route requires user to be authenticated, check if the token is valid */
                const tokenValidTo = $window.localStorage.getItem('validTo');
                const tokenValidToObject = new Date(tokenValidTo);
                if (new Date().getTime() > tokenValidToObject.getTime()) {
                    /* the token has expired */
                    if (tokenValidTo != null) {
                        $rootScope.badAuthentication = true;
                        $rootScope.badAuthenticationMessage = "Twoja sesja wygasła. Zaloguj się ponownie.";
                    }
                    /* clear user info, redirect to login */
                    console.warn("Token expired.");
                    $window.localStorage.clear();
                    $location.path('/login');
                    return;
                }

                /* token is valid, check if user has required role */
                const loggedUserRole = $window.localStorage.getItem('role');
                /* next route has required roles to match */
                if(nextRoute.requiredRoles){
                    if(!nextRoute.requiredRoles.includes(loggedUserRole)){
                        console.warn("User not authorized.");
                        $location.path('/not-authorized');
                    }
                }
            }
        }
    });
});