app.controller("UserController", function ($scope, $rootScope, $mdDialog, $location, httpService, constants) {
    $scope.scopeGetUserRoleFromDictionary = $rootScope.getUserRoleFromDictionary;
    $scope.scopeGetUserGenderFromDictionary = $rootScope.getUserGenderFromDictionary;
    $scope.userData = {};
    $scope.confirmPassword = "";
    $scope.isAvatarUploaded = false;
    $scope.uploadedAvatarUrl = "";
    $scope.userToEdit = null;

    $scope.initController = function () {
        $scope.getUser();
    };

    const onFormSubmit = function () {
        const userId = localStorage.getItem('userId');
        const updateUrl = '/api/users/'.concat(userId);

        //delete unecessary properties to ensure proper api binding
        delete $scope.userToEdit.roleDictionary;
        delete $scope.userToEdit.genderDictionary;
        delete $scope.userToEdit.lastInvalidLogin;
        delete $scope.userToEdit.lastValidLogin;
        delete $scope.userToEdit.birthdateFormated;

        //update edited extra fields
        $scope.userToEdit.photoUrl = $scope.uploadedAvatarUrl;

        const payload = JSON.stringify($scope.userToEdit);

        httpService.putData(updateUrl, payload)
            .then(() => {
                $location.path('/my-profile');
                $scope.getUser();
            }).catch(error => console.log("Error while puting data: " + error.data));
    };

    $scope.showEditUserModal = function (ev) {
        $scope.userToEdit = $scope.userData;
        $mdDialog.show({
            controller: DialogController,
            locals: {
                data: $scope
            },
            templateUrl: './modals/edit-user-modal.html',
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

    function DialogController($scope, $mdDialog, data) {
        //inject data to form (2 way binding)
        $scope.dialog = data;

        $scope.hideForm = () => $mdDialog.hide();
        $scope.cancelForm = () => $mdDialog.cancel();
        $scope.submitForm = () => $mdDialog.hide();
    }


    $scope.getUser = function () {
        const userUrl = '/api/users/'.concat(localStorage.getItem('userId'));
        return httpService.getData(userUrl)
            .then(response => {
                $scope.userData = getFullNamesOfUserAttibutes(response.data);
                $scope.userData.roleDictionary = $scope.scopeGetUserRoleFromDictionary($scope.userData.role);
                $scope.userData.genderDictionary = $scope.scopeGetUserGenderFromDictionary($scope.userData.gender);
            }).catch(error => console.log("Error while retrieving data: " + error.data));
    };

    const getFullNamesOfUserAttibutes = function (user) {
        let expandedUser = user;
        expandedUser.birthdateFormated = constants.formatDate(user.birthdate, false);
        expandedUser.lastValidLogin = constants.formatDate(user.lastValidLogin, true);
        expandedUser.lastInvalidLogin = constants.formatDate(user.lastInvalidLogin, true);
        return expandedUser;
    };

    $scope.uploadFile = function () {
        $.ajax({
            url: 'api/photoupload/upload',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
            data: new FormData($('#userEditForm')[0]),
            cache: false,
            contentType: false,
            processData: false,
        }).then(response => {
            const splitedUrl = response.url.split("\\")[8];
            const avatarFullUrl = getAvatarFullUrl(splitedUrl);

            $scope.uploadedAvatarUrl = avatarFullUrl;
            $scope.isAvatarUploaded = true;
            $scope.$applyAsync();
        }).catch(error => {
            console.log("Error while writing data: " + error);
        });
    };

    const getAvatarFullUrl = function (name) {
        return '/img/uploads/avatars/' + name;
    };

});