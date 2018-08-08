app.controller("RootController", function ($rootScope, $http, httpService, $scope, $window, $route, $location, constants) {
    $rootScope.pageTitle = "Strona główna";
    $rootScope.genderDictionary = [];
    $rootScope.roleDictionary = [];
    $rootScope.isDictionaryDataFetched = false;


    $scope.getDictionaries = function () {
        const rolesDictionaryUrl = '/api/dictionaries/roles';
        const gendersDictionaryUrl = '/api/dictionaries/genders';

        httpService.getData(rolesDictionaryUrl)
            .then(function (response) {
                $rootScope.roleDictionary = response.data;
            })
            .then(httpService.getData(gendersDictionaryUrl)
                .then(function (response1) {
                    $rootScope.genderDictionary = response1.data;
                    $rootScope.isDictionaryDataFetched = true;
                })
            ).catch(error => console.log("Error while retrieving data: " + error));
    };

    $rootScope.getUserRoleFromDictionary = function (roleId) {
        if (!$rootScope.isDictionaryDataFetched) {
            return;
        }
        return ($rootScope.roleDictionary.filter(r => r.value === roleId))[0].dictionary;
    };

    $rootScope.getUserGenderFromDictionary = function (genderId) {
        if (!$rootScope.isDictionaryDataFetched) {
            return;
        }
        return ($rootScope.genderDictionary.filter(g => g.value === genderId))[0].dictionary;
    };

    $scope.logout = function () {
        console.log('Log out...');
        $window.localStorage.clear();

        $rootScope.badAuthentication = false;
        $rootScope.badAuthenticationMessage = '';

        $route.reload();
    };


});