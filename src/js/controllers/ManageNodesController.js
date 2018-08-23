app.controller("ManageNodesController", function ($scope, $rootScope, httpService, $mdDialog) {
    $scope.getNodeTypeFromDictionary = $rootScope.getNodeTypeFromDictionary;
    $scope.getSensorTypeFromDictionary = $rootScope.getSensorTypeFromDictionary;
    $scope.getActuatorTypeFromDictionary = $rootScope.getActuatorTypeFromDictionary;
    $scope.isEditing = false; //default => adding new 
    $scope.isFetching = true;
    $scope.nodes = [];
    $scope.nodeForm = {};

    /* bootstrap message boxes */
    $scope.isNodeErrorMessageVisible = false;
    $scope.isNodeSuccessMessageVisible = false;
    $scope.nodeErrorMessage = '';
    $scope.nodeSuccessMessage = '';
    $scope.isControlErrorMessageVisible = false;
    $scope.isControlSuccessMessageVisible = false;
    $scope.controlErrorMessage = '';
    $scope.controlSuccessMessage = '';

    $scope.initController = function () {
        $scope.getAllNodes();
    };

    /* add/edit form and modal */
    $scope.formModalFired = function (e, isUpdating, id) {
        $scope.isEditing = isUpdating;
        $scope.nodeForm = $scope.nodes.filter(n => n.id === id)[0] || {};
        $scope.showNodeForm(e);
    };

    $scope.showNodeForm = function (ev) {
        $mdDialog.show({
            controller: DialogController,
            locals: {
                isEditing: $scope.isEditing,
                dataToPass: $scope.nodeForm,
                nodeDictionary: $rootScope.nodeTypeDictionary,
                sensorDictionary: $rootScope.sensorTypeDictionary,
                actuatorDictionary: $rootScope.actuatorTypeDictionary
            },
            templateUrl: './modals/node-edit-modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false // Only for -xs, -sm breakpoints.
        }).then(() => {
            updateNodeData();
        }, () => {
            console.log('Clicked cancel');
        });
    };

    function DialogController($scope, $mdDialog, dataToPass, nodeDictionary, sensorDictionary, actuatorDictionary, isEditing) {
        //inject data to form (2 way binding)
        $scope.form = dataToPass;
        $scope.nodeDictionary = nodeDictionary;
        $scope.sensorDictionary = sensorDictionary;
        $scope.actuatorDictionary = actuatorDictionary;
        $scope.isEditing = isEditing;

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

    /* CRUD http operations */
    const updateNodeData = function () {
        $scope.isFetching = true;
        if ($scope.isEditing === true) { //PUT
            httpService.putData('/api/nodes/'.concat($scope.nodeForm.id), JSON.stringify($scope.nodeForm))
                .then(resp => {
                    $scope.isFetching = false;
                    $scope.isNodeSuccessMessageVisible = true;
                    $scope.nodeSuccessMessage = 'Zaktualizowano urządzenie ' + $scope.nodeForm.name + '.';
                    $scope.getAllNodes();
                }).catch(error => {
                    $scope.isFetching = false;
                    $scope.isNodeErrorMessageVisible = true;
                    $scope.nodeErrorMessage = 'Nie udało się zaktualizować urządzenia ' + $scope.nodeForm.name + '.';
                    console.error("Error while puting data: " + error.data);
                });
        } else { //POST
            let formData = $scope.nodeForm;
            delete formData.id;
            httpService.postData('/api/nodes', JSON.stringify(formData))
                .then(() => {
                    $scope.isFetching = false;
                    $scope.isNodeSuccessMessageVisible = true;
                    $scope.nodeSuccessMessage = 'Dodano urządzenie ' + $scope.nodeForm.name + '.';
                    $scope.getAllNodes();
                }).catch(error => {
                    $scope.isFetching = false;
                    $scope.isNodeErrorMessageVisible = true;
                    $scope.nodeErrorMessage = 'Nie udało się dodać urządzenia ' + $scope.nodeForm.name + '.';
                    console.error("Error while puting data: " + error.data);
                });
        }
    };

    $scope.deleteNode = function (nodeId) {
        if (confirm("Czy na pewno chcesz usunąć wybrane urządzenie?")) {
            $scope.isFetching = true;
            httpService.deleteData('/api/nodes/'.concat(nodeId))
                .then(() => {
                    $scope.isNodeSuccessMessageVisible = true;
                    $scope.nodeSuccessMessage = 'Usunięto urządzenie ' + $scope.nodes.filter(n => n.id === nodeId)[0].name + '.';
                    $scope.getAllNodes();
                })
                .catch(error => {
                    $scope.isFetching = false;
                    $scope.isNodeErrorMessageVisible = true;
                    $scope.nodeErrorMessage = 'Nie udało się usunąć urządzenia ' + $scope.nodeForm.name + '.';
                    console.error("Error while puting data: " + error.data);
                });
        }
    };

    $scope.getAllNodes = function () {
        $scope.isFetching = true;
        httpService.getData('/api/nodes')
            .then(resp => {
                $scope.nodes = resp.data;
                $scope.isFetching = false;
            }).catch(error => {
                $scope.isFetching = false;
                $scope.isNodeErrorMessageVisible = true;
                $scope.nodeErrorMessage = 'Nie udało się pobrać listy urządzeń.';
                console.error("Error while getting data: " + error.data);
            });
    };

    /* for Control template: */
    $scope.getActuators = function () {
        httpService.getData('/api/nodes/type/1')
            .then(resp => {
                $scope.nodes = resp.data;
            }).catch(error => {
                console.error("Error while getting data: " + error.data);
            });
    };

    $scope.onToggle = function (nodeId) {
        let state;
        const node = $scope.nodes.filter(node => node.id === nodeId)[0];
        node.isOn === true ? state = 'on' : state = 'off';

        let uri = '/api/devices/set?id='.concat(nodeId).concat('&subId=0'.concat('&value='.concat(state)));

        httpService.postData(uri, null)
        .then(() => {
            $scope.isControlSuccessMessageVisible = true;
            $scope.controlSuccessMessage = 'Zmienoino stan urządzenia '.concat(node.name).concat('na stan: ').concat(node.isOn ? 'włączony' : 'wyłączony');
        }).catch(error => {
            $scope.isControlErrorMessageVisible = true;
            $scope.controlErrorMessage = 'Nie udało się zmienić stanu urządzenia '.concat(node.name).concat(' . Sprawdź, czy urządzenie ma dostęp do sieci.');
            console.error("Error while puting data: " + error.data);
        });
    };
});