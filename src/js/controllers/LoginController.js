app.controller("LoginController", function ($rootScope, $scope, httpService, $window, $location) {
    $scope.login = function () {
        let credentials = JSON.stringify({
            username: $scope.username,
            password: $scope.password
        });

        httpService.postData('/api/token/', credentials)
        .then(function onSuccess(response) {
            $scope.badAuthentication = false;
            $scope.username = '';
            $scope.password = '';
            $window.localStorage.setItem('token', response.data.token);
            $window.localStorage.setItem('userId', response.data.userId);
            $window.localStorage.setItem('validTo', response.data.tokenValidTo);
            $window.localStorage.setItem('role', response.data.userRole);

            $location.path('/');
        }, function onError(error) {
            $scope.username = '';
            $scope.password = '';
            $rootScope.badAuthentication = true;
            if (error.data.length < 100) {
                $rootScope.badAuthenticationMessage = error.data;
            } else 
                $rootScope.badAuthenticationMessage = "Wystąpił błąd.";
        });
    };
});