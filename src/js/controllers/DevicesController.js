app.controller("DevicesController", function ($scope, httpService) {
    $scope.isControlErrorMessageVisible = false;
    $scope.isControlSuccessMessageVisible = false;
    $scope.controlErrorMessage = "";
    $scope.controlSuccessMessage = "";

    $scope.initController = () => {
        $scope.getActuators();
    };

    /* for Control template: */
    $scope.getActuators = function () {
        httpService
            .getData("/api/nodes/type/1")
            .then(resp => {
                if (resp.data.length === 0) $scope.noDevices = true;
                $scope.nodes = resp.data;
            })
            .catch(error => {
                $scope.noDevices = true;
                console.error("Error while getting data: " + error.data);
            });
    };

    const setDeviceState = (device, on) => {
        const data = {
            state: `${device.identifier}=${on}`
        }
        const uri = `/api/Devices/set/${device.identifier}`
        httpService.postData(uri, JSON.stringify(data))
        .then(() => {
            $scope.isControlSuccessMessageVisible = true;
            $scope.controlSuccessMessage = "Zmienoino stan urządzenia "
                .concat(device.name)
                .concat("na stan: ")
                .concat(device.isOn ? "włączony" : "wyłączony");
        })
        .catch(error => {
            $scope.isControlErrorMessageVisible = true;
            $scope.controlErrorMessage = "Nie udało się zmienić stanu urządzenia "
                .concat(device.name)
                .concat(" . Sprawdź, czy urządzenie ma dostęp do sieci.");
            console.error("Error while puting data: " + error.data);
        });
    }
    $scope.onToggle = function (nodeId) {
        const node = $scope.nodes.filter(node => node.id === nodeId)[0];
        node.isOn === true ? (state = "on") : (state = "off");
        setDeviceState(node, state);

    };
});
