app.controller("ManageSystemController", function ($scope, $mdDialog, httpService) {
    const baseUrl = '/api/system/settings';
    $scope.isOpertionSuccess = false;
    $scope.isOperationFail = false;
    $scope.successMessage = '';
    $scope.errorMessage = '';
    $scope.isFetching = true;
    $scope.serverFormData = [];

    $scope.initController = function(){
        $scope.isFetching = true;
        httpService.getData(baseUrl)
            .then(response => {
                $scope.serverFormData = response.data[0];
                $scope.isFetching = false;
            })
            .catch(error => {
                console.log('Wystapił błąd: ' + error.data);
                $scope.isOperationFail = true;
                $scope.isFetching = false;
                $scope.errorMessage = 'Wystąpił nieoczekiwany błąd przy pobieraniu danych. Sprawdź połączenie sieciowe.';
            });
    };

    $scope.putSettings = function () {
        $scope.isFetching = true;
        httpService.putData(`${baseUrl}/${$scope.serverFormData.id}`, getFormData())
            .then(response => {
                $scope.isFetching = false;
                $scope.successMessage = 'Udało się zaktualizować ustawienia!';
                $scope.isOpertionSuccess = true;
            })
            .catch(error => {
                console.log('Wystapił błąd: ' + error);
                $scope.isOperationFail = true;
                $scope.isFetching = false;
                $scope.errorMessage = 'Wystąpił nieoczekiwany błąd przy pobieraniu danych. Sprawdź połączenie sieciowe.';
            });
    };

    const getFormData = function(){
        return JSON.stringify({
            RpiUrl: $scope.serverFormData.rpiUrl,
            Login: $scope.serverFormData.rpiLogin,
            Password: $scope.serverFormData.rpiPassword
        });
    }
});