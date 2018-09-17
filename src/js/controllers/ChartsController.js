app.controller("ChartsController", function ($scope, httpService) {
    $scope.sensorsIdentifiers = [];
    $scope.noSensors = false;

    $scope.initController = () => {
        httpService.getData('/api/nodes/type/0')
            .then(response => {
                if (response.data.length === 0) $scope.noSensors = true;
                for (let i = 0; i < response.data.length; i++) {
                    const properties = JSON.parse(response.data[i].registredProperties);
                    for (let propItem of properties) {
                        $scope.sensorsIdentifiers.push({
                            isFetched: false,
                            canvasName: `canvas-chart-${response.data[i].identifier}-${propItem}`,
                            take: 100,
                            skip: 0,
                            from: new Date(2000, 0, 0),
                            to: new Date(),
                            identifier: response.data[i].identifier,
                            name: response.data[i].name,
                            property: propItem.toLowerCase(),
                            timeStamps: [],
                            data: []
                        });
                    }
                }
            })
            .catch(error => {
                $scope.noSensors = true;
                console.error("Error while retrieving data: ", error.data);
            });
    };

    $scope.getSpecifiedSesorData = chartContext => {
        const url = `/api/sensors/${chartContext.identifier}?skip=${chartContext.skip}&take=${chartContext.take}&property=all&from=${chartContext.from.toJSON()}&to=${chartContext.to.toJSON()}`;
        httpService.getData(url)
            .then(response => {
                if (response.data.data.length > 0) {
                    chartContext.isFetched = true;
                    /* the response is like (pseudo json) 
                    * {timeStamp: [], data: [{val: x, timeStamp: y}, {val: x, timeStamp: y},..]  so first we are getting the timestamps (common for all the datasets */
                    chartContext.timeStamps = response.data.data.map(i => i.timeStamp);

                    //move create chart outside of httpService to.. investigate
                    /* then get the single arrat of data of given dataset (property)  */
                    chartContext.data = response.data.data.map(i => JSON.parse(i.val)).map(i => i[chartContext.property]);

                    /* finally create chart with computed values */
                    /* if the first element of data is falsy, then there is no proper data 
                    * (probably a wrong node config vs a wrong ESP json properties) 
                    * in other case remove generated canvas and its parent (column) from DOM to repair layout */
                    if (chartContext.data[0]) $scope.createChart(chartContext);
                    else document.getElementById(chartContext.canvasName).parentElement.remove();
                } else {
                    console.warn(`Sensor '${chartContext.identifier}' has no data, so its skiped.`);
                }
            })
            .catch(error => {
                chartContext.isFetched = false;
                console.error("Error while retrieving data: ", error.data);
            });
    };

    $scope.createChart = chartContext => {
        const processedStamps = processTimestamps(chartContext.timeStamps);
        const ctx = document.getElementById(chartContext.canvasName).getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    data: chartContext.data
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
                    text: `Wykres z czujnika ${chartContext.identifier} - ${chartContext.property}`
                },
                scales: {
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        });
    };

    const processTimestamps = timeStamps => {
        const days = ['Nd', 'Pon', 'Wt', 'Sr', 'Czw', 'Pt', 'Sob'];
        let stampsArray = [];
        for (let timeStamp of timeStamps) {
            const date = new Date(timeStamp);
            const dateFormatted = `${days[date.getDay()]} ${date.getHours()} ${date.getMinutes()}`;
            stampsArray.push(dateFormatted);
        }
        return stampsArray;
    };
});