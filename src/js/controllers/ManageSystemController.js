app.controller("ManageSystemController", function ($scope, $mdDialog, httpService) {
    const baseUrl = '/api/system/settings';
    $scope.isOpertionSuccess = false;
    $scope.isOperationFail = false;
    $scope.successMessage = '';
    $scope.errorMessage = '';
    $scope.isFetching = true;
    $scope.serverFormData = [];
    $scope.isConnectionResultVisible = false;


    $scope.initController = function(){
        $scope.isFetching = true;
        httpService.getData(baseUrl)
            .then(response => {
                $scope.serverFormData = response.data[0];
                $scope.isFetching = false;
            })
            .catch(error => {
                $scope.isOperationFail = true;
                $scope.isFetching = false;
                $scope.errorMessage = 'Wystąpił nieoczekiwany błąd przy pobieraniu danych. Sprawdź połączenie sieciowe.';
                console.error(message, optionalParams)('Wystapił błąd: ' + error.data);
            });
    };

    $scope.checkConnection = () => {
        httpService.getData('api/time/now')
        .then(() => {
            $scope.isConnectionResultVisible = true;
            $scope.connectionSucess = true;
        }).catch(error => {
            $scope.isConnectionResultVisible = true;
            $scope.connectionSucess = false;
            console.error(`Brak komunikacji z serwerem: ${error.data}`);
        })
    }

    $scope.putSettings = () => {
        $scope.isFetching = true;
        httpService.putData(`${baseUrl}/${$scope.serverFormData.id}`, getFormData())
            .then(() => {
                $scope.isFetching = false;
                $scope.successMessage = 'Udało się zaktualizować ustawienia!';
                $scope.isOpertionSuccess = true;
            })
            .catch(() => {
                $scope.isOperationFail = true;
                $scope.isFetching = false;
                $scope.errorMessage = 'Wystąpił nieoczekiwany błąd przy pobieraniu danych. Sprawdź połączenie sieciowe.';
            });
    };

    const getFormData = () => {
        return JSON.stringify({
            RpiUrl: $scope.serverFormData.rpiUrl,
            Login: $scope.serverFormData.rpiLogin,
            Password: $scope.serverFormData.rpiPassword
        });
    }
});