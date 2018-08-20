app.controller("NodesController", function ($scope, $mdDialog, $http, $window, $document) {

    $scope.nodeForm = {};
    $scope.status = '  ';

    $scope.showAdvanced = function (ev) {
        $scope.nodeForm.email = "123@o2.pl";
        $mdDialog.show({
            controller: DialogController,
            locals: { dataToPass: $scope.nodeForm },
            templateUrl: './modals/node-edit-modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false // Only for -xs, -sm breakpoints.
        })
            .then(event => {
                console.log('YEP');
            }, () => {
                console.log('NOPE');
            });
    };

    function DialogController($scope, $mdDialog, dataToPass) {
        //inject data to form (2 way binding)
        $scope.form = dataToPass;
        
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
    }










    $scope.nodes = [];

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


    //ok
    $scope.getNodes = function () {
        const token = localStorage.getItem('token');
        $http({
            method: 'GET',
            url: '/api/nodes',
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

    //ok
    $scope.deleteNode = function (nodeId) {
        var result = confirm("Czy na pewno chcesz usunąć wybrane urządzenie?");
        if (result) {
            $http.delete('/api/nodes/'.concat(nodeId), {
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                'Accept': 'application/json'
            }).then(function onSuccess(data) {
                $('#nodes-info-sucessfully-deleted').show();
                $scope.getNodes(); //refresh area
            }, function onError(err) {
                $('#nodes-info-error-not-deleted').show();
            });
        }
    };
});