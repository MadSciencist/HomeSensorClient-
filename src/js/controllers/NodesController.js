app.controller("NodesController", function ($scope, $rootScope, httpService, $mdDialog, $http) {
    $scope.isEditing = false; //default => adding new 
    $scope.isFetching = true;
    $scope.nodes = [];
    $scope.nodeForm = {};

    $scope.initController = function () {
        getAllNodes();
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
        })
            .then(() => {
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
                    console.log(resp.data);
                }).catch(error => console.error("Error while puting data: " + error.data));
        } else { //POST
            let formData = $scope.nodeForm;
            delete formData.id;
            httpService.postData('/api/nodes', JSON.stringify(formData))
                .then(resp => {
                    $scope.isFetching = false;
                }).catch(error => console.error("Error while puting data: " + error.data));
        }
    };

    $scope.deleteNode = function (nodeId) {
        if (confirm("Czy na pewno chcesz usunąć wybrane urządzenie?")) {
            httpService.deleteData('/api/nodes/'.concat(nodeId))
                .then(() => getAllNodes())
                .catch(error => console.error("Error while puting data: " + error.data));
        }
    };

    getAllNodes = function () {
        httpService.getData('/api/nodes')
            .then(resp => {
                $scope.nodes = resp.data;
                $scope.isFetching = false;
            }).catch(error => console.error("Error while getting data: " + error.data));
    };












    $scope.onToggle = function (nodeId) {
        let state;

        const node = $scope.nodes.filter(node => node.id === nodeId);

        if (node[0].isOn === true)
            state = 'on';
        else if (node[0].isOn === false)
            state = 'off';

        let uri = '/api/devices/set?id='.concat(nodeId).concat('&subId=0'.concat('&value='.concat(state)));
        $http.post(uri, '[]', {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            'Accept': 'application/json'
        }).then(function onSuccess(data) {
            $('#devices-info-error-not-send').hide();
            $('#devices-info-success-text').text(formatChangedDeviceName(true, nodeId, data.data));
            $('#devices-info-sucessfully-send').show();
        }, function onError(error) {
            $('#devices-info-sucessfully-send').hide();
            $('#devices-info-error-text').text(formatChangedDeviceName(false, nodeId, error.data));
            $('#devices-info-error-not-send').show();
        });
    };

    function formatChangedDeviceName(isSuccess, nodeId, state) {
        const node = $scope.nodes.filter(node => node.id === nodeId);
        const name = node[0].name;
        if (isSuccess === true)
            return ' '.concat('Ustawiono stan urządzenia: ').concat(name).concat(' na stan: ').concat(state);
        else
            return ' '.concat('Nie można połączyć się z urządzeniem: ').concat(name).concat('  Więcej informacji: ').concat(state);
    }

    let nodeEactTypeVar = '';

    //ok
    $scope.exactNodeTypeChanged = function () {
        if ($scope.nodeType === 'nodeSensor') {
            nodeEactTypeVar = $scope.sensorType;
        } else if ($scope.nodeType === 'nodeActuator') {
            nodeEactTypeVar = $scope.actuatorType;
        }
    };

    let nodeEditRequest = {
        requestActive: false,
        nodeId: null
    };

    $scope.processAddEditNodeButton = function () {
        if (nodeEditRequest.requestActive === true) {
            let originalNode = ($scope.nodes.filter(n => n.id === nodeEditRequest.nodeId))[0];
            putNode(originalNode);
        } else {
            postNode();
            clearForm();
        }
        nodeEditRequest.requestActive = false;
    };

    let putNode = function (originalNode) {
        let editedNode = originalNode; //copy ID
        editedNode.name = $("#nodeName").val();
        editedNode.identifier = $("#nodeIdentifier").val();
        editedNode.type = $scope.nodeType;
        editedNode.exactType = nodeEactTypeVar;
        editedNode.loginName = $("#nodeLogin").val();
        editedNode.loginPassword = $("#nodePassword").val();

        if (editedNode.type === 'nodeActuator') {
            editedNode.ipAddress = $("#nodeIP").val();
            editedNode.gatewayAddress = $("#nodeGatewayIP").val();
        } else if (editedNode.node === 'nodeSensor') {
            editedNode.ipAddress = '';
            editedNode.gatewayAddress = '';
        }

        $http.put('/api/nodes/'.concat(nodeEditRequest.nodeId), JSON.stringify(editedNode), {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            'Accept': 'application/json'
        }).then(function onSuccess(data) {
            $('#nodes-info-error').hide();
            setTimeout(function () {
                $scope.getNodes(); //refresh area
            }, 250);

        }, function onError(error) {
            $('#nodes-info-error-text').text(error.data);
            $('#nodes-info-error').show();
        });
    };

    //ok
    let postNode = function () {
        const obj = {
            name: $("#nodeName").val(),
            identifier: $("#nodeIdentifier").val(),
            type: $scope.nodeType,
            exactType: nodeEactTypeVar,
            ipAddress: $("#nodeIP").val(),
            gatewayAddress: $("#nodeGatewayIP").val(),
            loginName: $("#nodeLogin").val(),
            loginPassword: $("#nodePassword").val()
        };

        $http.post('/api/nodes', JSON.stringify(obj), {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            'Accept': 'application/json'
        }).then(function onSuccess(data) {
            $('#nodes-info-error').hide();
            $scope.getNodes(); //refresh area
        }, function onError(error) {
            $('#nodes-info-error-text').text(error.data);
            $('#nodes-info-error').show();
        });
    };

    $scope.editNodePrefillForm = function (nodeId) {
        let selectedNode = ($scope.nodes.filter(n => n.id === nodeId))[0];
        nodeEditRequest.requestActive = true;
        nodeEditRequest.nodeId = nodeId;

        $("#addEditNodeModalLabel").text('Edytujesz urządzenie: '.concat(selectedNode.name));

        $("#nodeName").val(selectedNode.name);
        $("#nodeIdentifier").val(selectedNode.identifier);
        $("#nodeType").val(selectedNode.type);
        $("#nodeLogin").val(selectedNode.loginName);
        $("#nodePassword").val(selectedNode.loginPassword);

        if (selectedNode.type === 'nodeSensor') {
            $("#selectActuatorType").css('display', 'none');
            $("#selectSensorType").css('display', 'block');
            $("#sensorType").val(selectedNode.exactType);
        } else if (selectedNode.type === 'nodeActuator') {
            $("#selectSensorType").css('display', 'none');
            $("#selectActuatorType").css('display', 'block');
            $("#actuatorType").val(selectedNode.exactType);
            $("#nodeIP").val(selectedNode.ipAddress);
            $("#nodeGatewayIP").val(selectedNode.gatewayAddress);
        }
    };

    $scope.clearNodeForm = function () {
        $("#nodeName").val('');
        $("#nodeIdentifier").val('');
        $("#nodeLogin").val('');
        $("#nodePassword").val('');
        $("#nodeIP").val('');
        $("#nodeGatewayIP").val('');
    };

    //ok
    $scope.nodeTypeChanged = function () {
        if ($scope.nodeType === 'nodeSensor') {
            document.getElementById("selectSensorType").style.display = "block";
            document.getElementById("selectActuatorType").style.display = "none";
        } else if ($scope.nodeType === 'nodeActuator') {
            document.getElementById("selectActuatorType").style.display = "block";
            document.getElementById("selectSensorType").style.display = "none";
        }
    };

    //ok
    $scope.getActuators = function () {
        const token = localStorage.getItem('token');
        $http({
            method: 'GET',
            url: '/api/nodes/type/nodeactuator',
            headers: {
                'Content-Type': 'application-json; charset=UTF-8',
                'Authorization': 'Bearer '.concat(token)
            }
        }).then(function successCallback(response) {
            $scope.nodes = response.data;
        }, function errorCallback(response) {
            console.log(response);
        });
    };





});