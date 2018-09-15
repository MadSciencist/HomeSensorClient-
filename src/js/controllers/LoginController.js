app.controller("LoginController", function ($rootScope, $scope, $mdDialog, httpService, $window, $location) {
    $scope.registerForm = {};
    $scope.isRegisterSuccess = false;
    
    $scope.login = () => {
        const credentials = JSON.stringify({
            username: $scope.username,
            password: $scope.password
        });

        httpService.postData('/api/token/', credentials)
            .then(response => {
                $scope.badAuthentication = false;
                $scope.username = '';
                $scope.password = '';
                $window.localStorage.setItem('token', response.data.token);
                $window.localStorage.setItem('userId', response.data.userId);
                $window.localStorage.setItem('validTo', response.data.tokenValidTo);
                $window.localStorage.setItem('role', response.data.userRole);
                $location.path('/');
            }).catch(error => {
                $scope.username = '';
                $scope.password = '';
                $rootScope.badAuthentication = true;
                if (error.data.length < 100)
                    $rootScope.badAuthenticationMessage = error.data;
                else
                    $rootScope.badAuthenticationMessage = "Wystąpił błąd.";
            });
    };

    /* register stuff */
    $scope.showRegisterForm = ev => {
        $mdDialog.show({
            controller: DialogController,
            locals: { registerForm: $scope.registerForm },
            templateUrl: './modals/register-modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false // Only for -xs, -sm breakpoints.
        }).then(() => {
            onFormSubmit();
        }, () => {
            console.log('Clicked cancel');
        });
    };

    function DialogController($scope, $mdDialog, registerForm) {
        //inject data to form (2 way binding)
        $scope.form = registerForm;
        $scope.genderDictionary = $rootScope.genderDictionary;

        $scope.hideForm = () => $mdDialog.hide();
        $scope.cancelForm = () => $mdDialog.cancel();
        $scope.submitForm = () => $mdDialog.hide();
    }

    function onFormSubmit() {
        const registerUrl = '/api/users/new'
        httpService.postData(registerUrl, getRegisterFormData())
            .then(() => {
                $scope.isRegisterSuccess = true;
            }).catch(error => {
                $scope.isRegisterSuccess = false;
                console.error(error.data);
            })
    }

    function getRegisterFormData() {
        return JSON.stringify({
            name: $scope.registerForm.name || null,
            lastname: $scope.registerForm.lastname || null,
            email: $scope.registerForm.email || null,
            login: $scope.registerForm.login || null,
            password: $scope.registerForm.password || null,
            gender: $scope.registerForm.gender || null,
            birthdate: $scope.registerForm.birthdate || null
        });
    }
});