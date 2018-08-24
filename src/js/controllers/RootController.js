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

    $rootScope.getNodeTypeFromDictionary = function (key) {
        if (!$rootScope.isDictionaryDataFetched) {
            return;
        }
        return ($rootScope.nodeTypeDictionary.filter(n => n.key == key))[0].value;
    };

    $rootScope.getSensorTypeFromDictionary = function (key) {
        if (!$rootScope.isDictionaryDataFetched) {
            return;
        }
        return ($rootScope.sensorTypeDictionary.filter(n => n.key == key))[0].value;
    };

    $rootScope.getActuatorTypeFromDictionary = function (key) {
        if (!$rootScope.isDictionaryDataFetched) {
            return;
        }
        return ($rootScope.actuatorTypeDictionary.filter(n => n.key == key))[0].value;
    };

    $rootScope.getUserRoleFromDictionary = function (key) {
        if (!$rootScope.isDictionaryDataFetched) {
            return;
        }

        const dict = $rootScope.roleDictionary.filter(r => r.key == key)[0].value;
        return dict;
    };

    $rootScope.getUserGenderFromDictionary = function (key) {
        if (!$rootScope.isDictionaryDataFetched) {
            return;
        }
        return ($rootScope.genderDictionary.filter(g => g.key == key))[0].value;
    };

    $scope.logout = function () {
        console.log('Log out...');
        $window.localStorage.clear();

        $rootScope.badAuthentication = false;
        $rootScope.badAuthenticationMessage = '';

        $route.reload();
    };
});