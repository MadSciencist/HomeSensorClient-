app.controller("UsersController", function ($scope, $rootScope, $mdDialog, httpService, constants) {
    $scope.getUserRoleFromDictionary = $rootScope.getUserRoleFromDictionary;
    $scope.formatDate = constants.formatDate;
    $scope.userToEdit = null;
    $scope.users = [];
    $scope.isAuthorizedToViewAllUsers = false;
    $scope.isUpdateSuccess = false;
    $scope.isUpdateFailed = false;
    $scope.resultMessage = "";
    $scope.isDeleteSuccess = false;
    $scope.isDeleteFailed = false;
    const baseUsersUrl = "/api/users/";

    $scope.getUsers = () => {
            httpService.getData(baseUsersUrl)
                .then(response => {
                    $scope.users = response.data;
                }).catch(error => {
                    $scope.isAuthorizedToViewAllUsers = false;
                    console.warn("Error while retrieving data: " + error.data)
                });
    };

    /* add/edit form and modal */
    $scope.formModalFired = (e, id) => {
        $scope.userToEdit = $scope.users.filter(u => u.id == id)[0] || {};
        $scope.showUserEditModal(e);
    };

    $scope.showUserEditModal = (ev) => {
        $mdDialog.show({
            controller: DialogController,
            locals: {
                dataToPass: $scope.userToEdit,
                roleDictionary: $rootScope.roleDictionary
            },
            templateUrl: './modals/users-priviledges-modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false // Only for -xs, -sm breakpoints.
        }).then(() => {
            editUserRoleSubmit();
        }, () => {
            console.log('Clicked cancel');
        });
    };

    function DialogController($scope, $mdDialog, dataToPass, roleDictionary) {
        //inject data to form (2 way binding)
        $scope.form = dataToPass;
        $scope.roleDictionary = roleDictionary;

        $scope.hideForm = function () {
            $mdDialog.hide();
        };

        $scope.cancelForm = function () {
            $mdDialog.cancel();
        };

        $scope.submitForm = function (answer) {
            $mdDialog.hide(answer);
        };
    }

    const editUserRoleSubmit = () => {
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
                console.warn("Error while retrieving data: ", error.data);
            });
    };

    $scope.deleteUser = id => {
        const url = baseUsersUrl + id;
        $scope.userToEdit = ($scope.users.filter(u => u.id === id))[0];

        if (IsAdminTryingToDeleteItselfOrRemovePriviledges(id)) {
            $scope.isDeleteFailed = true;
            $scope.resultMessage = "Admin nie może się sam usunąć."
            return;
        }

        if(confirm(`Czy na pewno chcesz usunąć użytkownika ${$scope.userToEdit.name}?`)){
            httpService.deleteData(url)
            .then(() => {
                $scope.isDeleteSuccess = true;
                $scope.isDeleteFailed = false;
                $scope.resultMessage = "Udało się! Użytkownik " +
                    $scope.userToEdit.name + " " + $scope.userToEdit.lastname + " został usunięty."
                $scope.getUsers();
            }).catch(error => {
                $scope.isDeleteSuccess = false;
                $scope.isDeleteFailed = true;
                $scope.resultMessage = "Nie udało się usunąć użytkowika."
                console.warn("Error while retrieving data: " + error.data)
            });
        }
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