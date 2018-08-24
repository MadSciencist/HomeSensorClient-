app.controller("ManageStreamsController", function ($scope, $mdDialog, httpService) {
    const baseUrl = '/api/streamingdevices/';
    $scope.formData = {};
    $scope.streams = null;
    $scope.isOpertionSuccess = false;
    $scope.isOperationFail = false;
    $scope.successMessage = '';
    $scope.errorMessage = '';
    $scope.isEditing = false; //default => adding new 
    $scope.isFetching = true;

    $scope.initController = function () {
        $scope.getAllStreams();
    };

    /* add/edit form and modal */
    $scope.formModalFired = function (e, isUpdating, id) {
        $scope.isEditing = isUpdating;
        $scope.formData = $scope.streams.filter(s => s.id == id)[0] || {};
        $scope.showNodeForm(e);
    };

    $scope.showNodeForm = function (ev) {
        $mdDialog.show({
            controller: DialogController,
            locals: {
                isEditing: $scope.isEditing,
                dataToPass: $scope.formData
            },
            templateUrl: './modals/stream-edit-modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false // Only for -xs, -sm breakpoints.
        }).then(() => {
            createEditFormSubmit();
        }, () => {
            console.log('Clicked cancel');
        });
    };

    function DialogController($scope, $mdDialog, dataToPass, isEditing) {
        //inject data to form (2 way binding)
        $scope.form = dataToPass;
        $scope.isEditing = isEditing;

        $scope.hideForm = f$mdDialog.hide();

        $scope.hideForm = () => $mdDialog.hide();
        $scope.cancelForm = () => $mdDialog.cancel();
        $scope.submitForm = () => $mdDialog.hide();
    }

    const createEditFormSubmit = function () {
        $scope.isFetching = true;
        if ($scope.isEditing === true) {
            const updatingId = $scope.formData.id;
            const putUrl = baseUrl.concat(updatingId);

            httpService.putData(putUrl, getFormInputsData())
                .then(() => {
                    $scope.getAllStreams();
                    $scope.isFetching = false;
                    $scope.successMessage = `Stream ${$scope.formData.name} został edytowany!`;
                    $scope.isOpertionSuccess = true;
                })
                .catch(error => {
                    console.log('Wystapił błąd: ' + error.data);
                    $scope.isFetching = false;
                    $scope.isOperationFail = true;
                    $scope.errorMessage = `Wystąpił nieoczekiwany błąd przy edytowaniu streamu ${$scope.formData.name}. Sprawdź połączenie sieciowe.`;
                });
        } else {
            let data = getFormInputsData();
            delete data.id;

            httpService.postData(baseUrl, data)
                .then(() => {
                    $scope.getAllStreams();
                    $scope.isFetching = false;
                    $scope.successMessage = `Stream ${$scope.formData.name} dodany!`;
                    $scope.isOpertionSuccess = true;
                })
                .catch(error => {
                    console.log('Wystapił błąd: ' + error.data);
                    $scope.isFetching = false;
                    $scope.isOperationFail = true;
                    $scope.errorMessage = `Wystąpił nieoczekiwany błąd przy dodawaniu streamu ${$scope.formData.name}. Sprawdź połączenie sieciowe.`;
                });
        }
    };

    $scope.deleteStream = function (id) {
        $scope.isFetching = true;
        httpService.deleteData(baseUrl.concat(id))
            .then(() => {
                $scope.successMessage = "Stream usunięty!";
                $scope.isOpertionSuccess = true;
                $scope.getAllStreams();
                $scope.isFetching = false;
            })
            .catch(error => {
                console.log('Wystapił błąd: ' + error.data);
                $scope.isFetching = false;
                $scope.isOperationFail = true;
                $scope.errorMessage = `Wystąpił nieoczekiwany błąd przy usuwaniu streamu ${$scope.streams.filter(n => n.id === id)[0].name}. Sprawdź połączenie sieciowe.`;
            });
    };

    $scope.getAllStreams = function () {
        $scope.isFetching = true;
        httpService.getData(baseUrl)
            .then(response => {
                $scope.streams = response.data;
                $scope.isFetching = false;
            })
            .catch(error => {
                console.log('Wystapił błąd: ' + error);
                $scope.isOperationFail = true;
                $scope.isFetching = false;
                $scope.errorMessage = 'Wystąpił nieoczekiwany błąd przy pobieraniu danych. Sprawdź połączenie sieciowe.';
            });
    };

    const getFormInputsData = function () {
        return JSON.stringify({
            Name: $scope.formData.name,
            Description: $scope.formData.description,
            ConnectionString: $scope.formData.connectionString,
            Login: $scope.formData.login,
            Password: $scope.formData.password,
            Id: $scope.formData.id, //this property is needed for asp net proper binding
            AuthorizedUsers: []
        });
    };

    $scope.clearFormInputs = function () {
        $scope.formData.name = '';
        $scope.formData.description = '';
        $scope.formData.connectionString = '';
        $scope.formData.login = '';
        $scope.formData.password = ''
    };
});