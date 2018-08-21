app.controller("UserController", function ($scope, $rootScope, constants, $location, httpService) {
    $scope.scopeGetUserRoleFromDictionary = $rootScope.getUserRoleFromDictionary;
    $scope.scopeGetUserGenderFromDictionary = $rootScope.getUserGenderFromDictionary;
    $scope.userData = {};
    $scope.confirmPassword = "";
    $scope.isAvatarUploaded = false;
    $scope.uploadedAvatarUrl = "";
    $scope.userToEdit = null;
    let picker = null;

    $scope.initController = function () {
        $scope.getUser()
            .then(() => {
                initDatePicker();
            });
    };

    const initDatePicker = function () {
        const options = {
            position: 'tl',
            startDay: 0,
            dateSelected: new Date($scope.userData.birthdate),
            minDate: new Date(1920, 1, 1),
            customDays: ['Nd', 'Pon', 'Wt', 'śr', 'Czw', 'Pt', 'Sob'],
            customMonths: [
                "Styczeń", "Luty", "Marzec",
                "Kwiecień", "Maj", "Czerwiec", "Lipiec",
                "Sierpień", "Wrzesień", "Październik",
                "Listopad", "Grudzień"
            ],
            overlayPlaceholder: 'Wpisz rok',
            overlayButtom: 'Zatwierdź'
        };

        picker = datepicker(".date-picker-anchor", options);
    };

    $scope.editUser = function () {
        const token = localStorage.getItem('token');
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
        $scope.userToEdit.birthdate = picker.dateSelected;

        const payload = JSON.stringify($scope.userToEdit);

        httpService.putData(updateUrl, payload)
            .then(() => {
                $location.path('/my-profile');
                $scope.getUser();
            }).catch(error => console.log("Error while puting data: " + error));
    };

    $scope.createCopyOfUserToEdit = function () {
        $scope.userToEdit = $scope.userData;
    };

    $scope.getUser = function () {
        const userUrl = '/api/users/'.concat(localStorage.getItem('userId'));
        return httpService.getData(userUrl)
            .then(response => {
                $scope.userData = getFullNamesOfUserAttibutes(response.data);
                $scope.userData.roleDictionary = $scope.scopeGetUserRoleFromDictionary($scope.userData.role);
                $scope.userData.genderDictionary = $scope.scopeGetUserGenderFromDictionary($scope.userData.gender);
            }).catch(error => console.log("Error while retrieving data: " + error));
    };

    const getFullNamesOfUserAttibutes = function (user) {
        let expandedUser = user;
        expandedUser.birthdateFormated = formatDate(user.birthdate, false);
        expandedUser.lastValidLogin = formatDate(user.lastValidLogin, true);
        expandedUser.lastInvalidLogin = formatDate(user.lastInvalidLogin, true);
        return expandedUser;
    };

    $scope.uploadFile = function () {
        $.ajax({
            url: 'api/photoupload/upload',
            type: 'POST',

            data: new FormData($('#avatarUploadForm')[0]),
            cache: false,
            contentType: false,
            processData: false,
        }).then(function (response) {
            const splitedUrl = response.url.split("\\")[8];
            const avatarFullUrl = getAvatarFullUrl(splitedUrl);

            $scope.uploadedAvatarUrl = avatarFullUrl;
            $scope.isAvatarUploaded = true;
            $scope.$apply();
        }).catch(function (error) {
            console.log("Error while writing data: " + error);
        });
    };

    const getAvatarFullUrl = function (name) {
        return '/img/uploads/avatars/' + name;
    };

});