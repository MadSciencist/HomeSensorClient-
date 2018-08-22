app.controller("UsersController", function ($scope, $rootScope, httpService) {
    $scope.scopeGetUserRoleFromDictionary = $rootScope.getUserRoleFromDictionary;
    $scope.formatDate = formatDate;
    $scope.userToEdit = null;
    $scope.users = [];
    $scope.isAuthorizedToViewAllUsers = false;
    $scope.isUpdateSuccess = false;
    $scope.isUpdateFailed = false;
    $scope.resultMessage = "";
    $scope.isDeleteSuccess = false;
    $scope.isDeleteFailed = false;
    const baseUsersUrl = "/api/users/";

    $scope.getUsers = function () {
        if (localStorage.getItem('role') === "Admin") {
            $scope.isAuthorizedToViewAllUsers = true;

            httpService.getData(baseUsersUrl)
                .then(response => {
                    $scope.users = response.data;
                }).catch(error => {
                    $scope.isAuthorizedToViewAllUsers = false;
                    console.log("Error while retrieving data: " + error)
                });
        }
    };

    //on click priviledges, update current watched user to PUT
    $scope.editUserRole = function (id) {
        $scope.userToEdit = ($scope.users.filter(u => u.id === id))[0];
    };

    $scope.editUserRoleSubmit = function () {
        const url = baseUsersUrl + $scope.userToEdit.id;
        if (IsAdminTryingToDeleteItselfOrRemovePriviledges($scope.userToEdit.id)) {
            $scope.isUpdateFailed = true;
            $scope.resultMessage = "Admin nie może zmniejszyć sam swojej roli."
            return;
        }

        httpService.putData(url, JSON.stringify($scope.userToEdit))
            .then(() => {
                $scope.isUpdateSuccess = true;
                $scope.isUpdateFailed = false;
                $scope.resultMessage = "Udało się! Użytkownik " +
                    $scope.userToEdit.name + " " + $scope.userToEdit.lastname
                    + " ma teraz rolę: " + $scope.getUserRoleFromDictionary($scope.userToEdit.role);
                $scope.getUsers();
            }).catch(error => {
                $scope.isUpdateFailed = true;
                $scope.isUpdateSuccess = false;
                $scope.resultMessage = "Wystąpił błąd :("
                console.log("Error while retrieving data: ", error);
            });
    };

    $scope.deleteUser = function (id) {
        const url = baseUsersUrl + id;
        $scope.userToEdit = ($scope.users.filter(u => u.id === id))[0];

        if (IsAdminTryingToDeleteItselfOrRemovePriviledges(id)) {
            $scope.isDeleteFailed = true;
            $scope.resultMessage = "Admin nie może się sam usunąć."
            return;
        }

        httpService.deleteData(url)
            .then(function (response) {
                $scope.isDeleteSuccess = true;
                $scope.isDeleteFailed = false;
                $scope.resultMessage = "Udało się! Użytkownik " +
                    $scope.userToEdit.name + " " + $scope.userToEdit.lastname + " został usunięty."
                $scope.getUsers();
            }).catch(error => {
                $scope.isDeleteSuccess = false;
                $scope.isDeleteFailed = true;
                $scope.resultMessage = "Nie udało się usunąć użytkowika."
                console.log("Error while retrieving data: " + error)
            });
    };

    const IsAdminTryingToDeleteItselfOrRemovePriviledges = function (id) {
        const logedUserRole = localStorage.getItem("role");
        const logedUserId = localStorage.getItem("userId");
        if (logedUserRole === "Admin") {
            if (logedUserId == id) {
                console.warn("Admin cannot delete itself or remove it's priviledges.");
                return true;
            }
        }
        return false;
    };
});