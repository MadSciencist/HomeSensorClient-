app.controller("ChartsController", function ($scope, $rootScope, httpService, $window, $document) {
    $scope.sensorsIdentifiers = [];

    $scope.initController = function () {
        httpService.getData('/api/nodes/type/nodesensor')
            .then(response => {
                for (let i = 0; i < response.data.length; i++) {
                    $scope.sensorsIdentifiers.push({ identifier: response.data[i].identifier, name: response.data[i].name });
                }
            })
            .catch(error => {
                console.log("Error while retrieving data: ", error);
            });
    };

    $scope.getSpecifiedSesorData = function (identifier) {
        httpService.getData('/api/sensors/'.concat(identifier))
        .then(response => {
            const name = 'canvas-chart-'.concat(identifier);
            $scope.createChart(name, response.data);
        })
        .catch(error => {
            console.log("Error while retrieving data: ", error);
        });
     };

    $scope.createChart = function (container, dataArray) {
        const currentSensor = ($scope.sensorsIdentifiers.filter(s => s.identifier === dataArray[0].identifier))[0];
        const processedStamps = processTimestamps(dataArray);
        const sensorValues_Y = getValuesArray(dataArray);

        const ctx = document.getElementById(container).getContext('2d');
        const stackedLine = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    data: sensorValues_Y
                }],
                labels: processedStamps
            },
            options: {
                responsive: true,
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Wykres temperatury z czujnika '.concat(currentSensor.name)
                },
                scales: {
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        });
    };

    const getValuesArray = function (sensorAllDataArray) {
        let valuesArray = [];
        for (let i = 0; i < sensorAllDataArray.length; i++) {
            const indexOfStartValue = sensorAllDataArray[i].data.indexOf(':');
            const indexOfEndValue = sensorAllDataArray[i].data.indexOf('*');
            const stringValue = sensorAllDataArray[i].data.slice(indexOfStartValue + 1, indexOfEndValue);
            const numberValue = parseInt(stringValue);
            valuesArray.push(numberValue);
        }
        return valuesArray;
    };

    const processTimestamps = function (d) {
        const days = ['Nd', 'Pon', 'Wt', 'Sr', 'Czw', 'Pt', 'Sob'];
        let stampsArray = [];
        for (i = 0; i < d.length; i++) {
            let date = new Date(Date.parse(d[i].timeStamp));
            let dateFormatted = days[date.getDay()] + ' ' + date.getHours() + ':' + date.getMinutes();
            stampsArray.push(dateFormatted);
        }
        return stampsArray;
    };
});