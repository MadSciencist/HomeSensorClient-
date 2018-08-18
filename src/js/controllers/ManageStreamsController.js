app.controller("ManageStreamsController", function ($scope, httpService) {
    const baseUrl = '/api/streamingdevices/';
    $scope.formData = {};
    $scope.streams = null;
    $scope.isOpertionSuccess = false;
    $scope.isOperationFail = false;
    $scope.successMessage = '';
    $scope.errorMessage = '';
    $scope.isUpdating = false; //(PUT) if false -> is creating (POST) (default post, creating new)

    $scope.initController = function () {
        $scope.getAllStreams();
    };

    $scope.editStreamModalFired = function (id) {
        $scope.isUpdating = true;
        $scope.formData = $scope.streams.filter(s => s.id === id)[0];
    };

    $scope.createEditFormSubmit = function () {
        if ($scope.isUpdating === false) {
            let data = getFormInputsData();
            delete data.id;

            httpService.postData(baseUrl, data)
                .then(() => {
                    $scope.getAllStreams();
                    $scope.successMessage = `Stream ${$scope.formData.name} dodany!`;
                    $scope.isOpertionSuccess = true;
                })
                .catch(error => {
                    console.log('Wystapił błąd: ' + error);
                    $scope.isOperationFail = true;
                    $scope.errorMessage = `Wystąpił nieoczekiwany błąd przy dodawaniu streamu ${$scope.formData.name}. Sprawdź połączenie sieciowe.`;
                });
        } else { 
            const updatingId = $scope.formData.id;
            const putUrl = baseUrl.concat(updatingId);
            httpService.putData(putUrl, getFormInputsData())
                .then(() => {
                    $scope.getAllStreams();
                    $scope.successMessage = `Stream ${$scope.formData.name} został edytowany!`;
                    $scope.isOpertionSuccess = true;
                })
                .catch(error => {
                    console.log('Wystapił błąd: ' + error);
                    $scope.isOperationFail = true;
                    $scope.errorMessage = `Wystąpił nieoczekiwany błąd przy edytowaniu streamu ${$scope.formData.name}. Sprawdź połączenie sieciowe.`;
                });
        }
    };

    $scope.deleteStream = function (id) {
        httpService.deleteData(baseUrl.concat(id))
            .then(() => {
                $scope.successMessage = "Stream usunięty!";
                $scope.isOpertionSuccess = true;
                $scope.getAllStreams()
            })
            .catch(error => {
                console.log('Wystapił błąd: ' + error);
                $scope.isOperationFail = true;
                $scope.errorMessage = `Wystąpił nieoczekiwany błąd przy usuwaniu streamu ${$scope.streams.filter(n => n.id === id)[0].name}. Sprawdź połączenie sieciowe.`;
            });
    };

    $scope.getAllStreams = function () {
        httpService.getData(baseUrl)
            .then(response => $scope.streams = response.data)
            .catch(error => {
                console.log('Wystapił błąd: ' + error);
                $scope.isOperationFail = true;
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