app.controller("ChartsController", function ($scope, httpService) {
    $scope.sensorsIdentifiers = [];
    $scope.noSensors = false;

    $scope.initController = function () {
        httpService.getData('/api/nodes/type/0')
            .then(response => {
                if(response.data.length === 0) $scope.noSensors = true;
                for (let i = 0; i < response.data.length; i++) {
                    $scope.sensorsIdentifiers.push({ identifier: response.data[i].identifier, name: response.data[i].name });
                }
            })
            .catch(error => {
                $scope.noSensors = true;
                console.log("Error while retrieving data: ", error.data);
            });
    };

    $scope.getSpecifiedSesorData = function (identifier) {
        if(identifier === undefined) return;
            httpService.getData('/api/sensors/'.concat(identifier))
            .then(response => {
                if(response.data.length > 0){
                    const name = 'canvas-chart-'.concat(identifier);
                    $scope.createChart(name, response.data);
                }else {
                    console.warn(`Sensor '${identifier}' has no data, so its skiped.`);
                }
            })
            .catch(error => {
                console.log("Error while retrieving data: ", error.data);
            });
     };

    $scope.createChart = function (container, dataArray) {
        const currentSensor = $scope.sensorsIdentifiers.filter(s => s.identifier === dataArray[0].identifier)[0];
        const processedStamps = processTimestamps(dataArray);
        const sensorValues_Y = getValuesArray(dataArray);

        const ctx = document.getElementById(container).getContext('2d');
        new Chart(ctx, {
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
        for (let i = 0; i < d.length; i++) {
            let date = new Date(Date.parse(d[i].timeStamp));
            let dateFormatted = days[date.getDay()] + ' ' + date.getHours() + ':' + date.getMinutes();
            stampsArray.push(dateFormatted);
        }
        return stampsArray;
    };
});