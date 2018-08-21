app.controller("RootController", function ($rootScope, httpService, $q, $scope, $window, $route) {
    $rootScope.isDictionaryDataFetched = false;
    $scope.isUserAdmin = false;

    $scope.initController = function () {
        localStorage.getItem('role') === "Admin" ? $scope.isUserAdmin = true : $scope.isUserAdmin = false;

        /* parallel fetching, than wait for resolving the promise (all fetches have to be done */
        let fetch1 = httpService.getData('/api/dictionaries/roles')
            .then(r => { $rootScope.roleDictionary = r.data; });

        let fetch2 = httpService.getData('/api/dictionaries/genders')
            .then(r => { $rootScope.genderDictionary = r.data; });

        let fetch3 = httpService.getData('/api/dictionaries/types/node')
            .then(r => { $rootScope.nodeTypeDictionary = r.data; });

        let fetch4 = httpService.getData('/api/dictionaries/types/sensor')
            .then(r => { $rootScope.sensorTypeDictionary = r.data; });

        let fetch5 = httpService.getData('/api/dictionaries/types/actuator')
            .then(r => { $rootScope.actuatorTypeDictionary = r.data; });

        $q.all([fetch1, fetch2, fetch3, fetch4, fetch5]).then(() => {
            console.log('All dictionaries data fetched.');
            $rootScope.isDictionaryDataFetched = true;
        });
    };

    $rootScope.getUserRoleFromDictionary = function (roleId) {
        if (!$rootScope.isDictionaryDataFetched) {
            return;
        }
        return ($rootScope.roleDictionary.filter(r => r.key === roleId))[0].value;
    };

    $rootScope.getUserGenderFromDictionary = function (genderId) {
        if (!$rootScope.isDictionaryDataFetched) {
            return;
        }
        return ($rootScope.genderDictionary.filter(g => g.key === genderId))[0].value;
    };

    $scope.logout = function () {
        console.log('Log out...');
        $window.localStorage.clear();

        $rootScope.badAuthentication = false;
        $rootScope.badAuthenticationMessage = '';

        $route.reload();
    };
});