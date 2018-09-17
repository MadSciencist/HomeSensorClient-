app.controller("ManageNodesController", function ($scope, $rootScope, httpService, $mdDialog, $routeParams, $location) {
    $scope.getNodeTypeFromDictionary = $rootScope.getNodeTypeFromDictionary;
    $scope.getSensorTypeFromDictionary = $rootScope.getSensorTypeFromDictionary;
    $scope.getActuatorTypeFromDictionary = $rootScope.getActuatorTypeFromDictionary;
    $scope.isEditing = false; //default => adding new
    $scope.isFetching = true;
    $scope.nodes = [];
    $scope.nodeForm = {};
    $scope.noDevices = false;

    /* bootstrap message boxes */
    $scope.isNodeErrorMessageVisible = false;
    $scope.isNodeSuccessMessageVisible = false;
    $scope.nodeErrorMessage = "";
    $scope.nodeSuccessMessage = "";
    $scope.isControlErrorMessageVisible = false;
    $scope.isControlSuccessMessageVisible = false;
    $scope.controlErrorMessage = "";
    $scope.controlSuccessMessage = "";

    $scope.selectedSensorActuatorTypes = [];
    $scope.searchText = null;

    $scope.initController = () => {
        $scope.getAllNodes().then(() => {
            if($routeParams.mode === 'edit'){
                $scope.formModalFired(null, true, parseInt($routeParams.id));
            }
        });
    };

    $scope.transformChip = chip => {
        // If it is an object, it's already a known chip
        if (angular.isObject(chip)) {
            return chip;
        }
        // Otherwise, create a new one
        return { name: chip, type: "new" };
    };

    $scope.querySearch = (query, type) => {
        let chipItemsPool = null;

        if (type === "sensor") {
            chipItemsPool =
                $rootScope.sensorTypeDictionary.map(i => {
                    return { value: i.value, key: i.value.toLowerCase() };
                }) || [];
        } else if (type === "actuator") {
            chipItemsPool =
                $rootScope.actuatorTypeDictionary.map(i => {
                    return { value: i.value, key: i.value.toLowerCase() };
                }) || [];
        }

        return query ? chipItemsPool.filter(filterAnyPosition(query)) : [];
    };

    const filterAnyPosition = query => {
        const lowercaseQuery = query.toLowerCase();
        //return a filter fuction which matches the string from first index
        return query => {
            return query.key.search(lowercaseQuery) > -1;
        };
    };

    /* add/edit form and modal */
    $scope.formModalFired = function (e, isUpdating, id) {
        $scope.isEditing = isUpdating;
        $scope.nodeForm = $scope.nodes.filter(n => n.id === id)[0] || {};
        if (isUpdating) $scope.selectedSensorActuatorTypes = $scope.nodeForm.chipProperties;
        else $scope.selectedSensorActuatorTypes = [];
        $scope.showNodeForm(e);
    };

    $scope.showNodeForm = function (ev) {
        $mdDialog
            .show({
                controller: DialogController,
                locals: { data: $scope },
                templateUrl: "./modals/node-edit-modal.html",
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: true // Only for -xs, -sm breakpoints.
            })
            .then(
                () => {
                    updateNodeData();
                    resetRoute();
                },
                () => {
                    resetRoute();
                }
            );
    };

    const DialogController = ($scope, $mdDialog, data) => {
        $scope.dialog = data;
        $scope.hideForm = () => $mdDialog.hide();
        $scope.cancelForm = () => $mdDialog.cancel();
        $scope.submitForm = () => $mdDialog.hide();
    }

    /* CRUD http operations */
    const updateNodeData = function () {
        $scope.isFetching = true;
        let formData = getFormData();
        formData.id = $scope.nodeForm.id;

        if ($scope.isEditing === true) {
            //PUT
            httpService
                .putData("/api/nodes/".concat($scope.nodeForm.id), JSON.stringify(formData))
                .then(() => {
                    scrollToMessagebar();
                    $scope.isFetching = false;
                    $scope.isNodeSuccessMessageVisible = true;
                    $scope.nodeSuccessMessage = "Zaktualizowano urządzenie " + $scope.nodeForm.name + ".";
                    $scope.getAllNodes();
                })
                .catch(error => {
                    scrollToMessagebar();
                    $scope.getAllNodes(); //revert changes
                    $scope.isFetching = false;
                    $scope.isNodeErrorMessageVisible = true;
                    $scope.nodeErrorMessage = "Nie udało się zaktualizować urządzenia " + $scope.nodeForm.name + ".";
                    console.error("Error while puting data: " + error.data);
                });
        } else {
            //POST
            httpService
                .postData("/api/nodes", JSON.stringify(getFormData()))
                .then(() => {
                    scrollToMessagebar();
                    $scope.isFetching = false;
                    $scope.isNodeSuccessMessageVisible = true;
                    $scope.nodeSuccessMessage = "Dodano urządzenie " + $scope.nodeForm.name + ".";
                    $scope.getAllNodes();
                })
                .catch(error => {
                    scrollToMessagebar();
                    $scope.getAllNodes(); //revert changes
                    $scope.isFetching = false;
                    $scope.isNodeErrorMessageVisible = true;
                    $scope.nodeErrorMessage =
                        "Nie udało się dodać urządzenia " + $scope.nodeForm.name + ". Być może takie urządzenie już istnieje.";
                    console.error("Error while puting data: " + error.data);
                });
        }
    };

    const getFormData = () => {
        const nodeProperties = $scope.selectedSensorActuatorTypes.map(i => i.value) || [];
        return {
            name: $scope.nodeForm.name,
            identifier: $scope.nodeForm.identifier,
            description: $scope.nodeForm.description,
            loginName: $scope.nodeForm.loginName,
            loginPassword: $scope.nodeForm.loginPassword,
            nodeType: $scope.nodeForm.nodeType,
            ipAddress: $scope.nodeForm.ipAddress,
            gatewayAddress: $scope.nodeForm.gatewayAddress,
            RegistredProperties: JSON.stringify(nodeProperties)
        };
    }

    $scope.deleteNode = function (nodeId) {
        if (confirm("Czy na pewno chcesz usunąć wybrane urządzenie?")) {
            $scope.isFetching = true;
            httpService
                .deleteData("/api/nodes/".concat(nodeId))
                .then(() => {
                    scrollToMessagebar();
                    $scope.isNodeSuccessMessageVisible = true;
                    $scope.nodeSuccessMessage = "Usunięto urządzenie " + $scope.nodes.filter(n => n.id === nodeId)[0].name + ".";
                    $scope.getAllNodes();
                })
                .catch(error => {
                    scrollToMessagebar();
                    $scope.isFetching = false;
                    $scope.isNodeErrorMessageVisible = true;
                    $scope.nodeErrorMessage = "Nie udało się usunąć urządzenia " + $scope.nodeForm.name + ".";
                    console.error("Error while puting data: " + error.data);
                });
        }
    };

    $scope.getAllNodes = async () => {
        $scope.isFetching = true;
        await httpService
            .getData("/api/nodes")
            .then(resp => {
                $scope.isFetching = false;
                $scope.nodes = resp.data;
                for (let i = 0; i < $scope.nodes.length; i++) {
                    //skip falsy values such as undefined (null in db)
                    if (!$scope.nodes[i].registredProperties) continue;
                    const parsedProps = JSON.parse($scope.nodes[i].registredProperties) || []; //change json strint to object
                    $scope.nodes[i].formatedProperties = parsedProps
                        .map(s => s.charAt(0).toUpperCase() + s.substring(1)) //first chars to uppercase
                        .join(" ");
                    $scope.nodes[i].chipProperties = parsedProps.map(i => ({ key: i.toLowerCase(), value: i }));
                }
            })
            .catch(error => {
                scrollToMessagebar();
                $scope.isFetching = false;
                $scope.isNodeErrorMessageVisible = true;
                $scope.nodeErrorMessage = "Nie udało się pobrać listy urządzeń.";
                console.error("Error while getting data: " + error.data);
            });
    };

    const scrollToMessagebar = () => {
        document.getElementById("message-anchor").scrollIntoView(false);
    };

    const resetRoute = () => {
        const route = $routeParams;
        if(route.mode === 'edit'){
            $location.search({});
            $location.path('/manage-nodes');
        }
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

    $scope.onToggle = function (nodeId) {
        let state;
        const node = $scope.nodes.filter(node => node.id === nodeId)[0];
        node.isOn === true ? (state = "on") : (state = "off");

        let uri = "/api/devices/set?id=".concat(nodeId).concat("&subId=0".concat("&value=".concat(state)));

        httpService
            .postData(uri, null)
            .then(() => {
                $scope.isControlSuccessMessageVisible = true;
                $scope.controlSuccessMessage = "Zmienoino stan urządzenia "
                    .concat(node.name)
                    .concat("na stan: ")
                    .concat(node.isOn ? "włączony" : "wyłączony");
            })
            .catch(error => {
                $scope.isControlErrorMessageVisible = true;
                $scope.controlErrorMessage = "Nie udało się zmienić stanu urządzenia "
                    .concat(node.name)
                    .concat(" . Sprawdź, czy urządzenie ma dostęp do sieci.");
                console.error("Error while puting data: " + error.data);
            });
    };
});

/*
    * maybe one day....
    *   const filterFromBegining = query => {
        const lowercaseQuery = query.toLowerCase();
        //return a filter fuction which matches the string from first index
        return query => {
            return (query.value.indexOf(lowercaseQuery) === 0)
        };
    }
    */