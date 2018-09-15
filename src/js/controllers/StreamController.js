app.controller("StreamController", function ($scope, httpService) {
    const baseUrl = '/api/streamingdevices/';
    $scope.isMessagebarVisible = false;
    $scope.messagebarMessage = '';
    $scope.playerSettings = '{"fluid": true}';
    $scope.streams = {};
    $scope.selectedStreamKey = '';
    $scope.noStreams = false;

    $scope.initController = function () {
        getAllStreams();
    };

    $scope.startStream = () => beginStream();
    $scope.stopStream = () => stopStream();

    $scope.streamChanged = () => {
        const selectedStream = $scope.streams.filter(s => s.key === $scope.selectedStreamKey)[0];
        $scope.selectedStreamKey = selectedStream.key;
        $scope.streamUrl = selectedStream.url;
        $scope.streamDescription = selectedStream.description;
    };

    const getAllStreams = () => {
        httpService.getData(baseUrl)
            .then(response => {
                if (response.data.length === 0) {
                    $scope.noStreams = true;
                    return;
                }
                $scope.streams = response.data.map(i => ({
                    dictionary: i.name,
                    key: i.id,
                    url: i.connectionString,
                    description: i.description
                }))
                $scope.selectedStreamKey = $scope.streams[0].key;
                $scope.streamDescription = $scope.streams[0].description;
            }).catch(error => {
                $scope.noStreams = true;
                console.log('Wystapił błąd: ' + error.data);
            });
    };

    const beginStream = () => {
        const url = '/api/rpiprocesses/ffmpeg/start';
        const data = JSON.stringify({
            StreamingDeviceId: $scope.selectedStreamKey,
            resolution: 'auto'
        });

        httpService.postData(url, data)
            .then(response => {
                console.log(response);
            }).catch(error => {
                $scope.isMessagebarVisible = true;
                $scope.messagebarMessage = "Ups! Coś poszło nie tak. Sprawdź połączenie sieciowe."
                console.log("Error while retrieving data: " + error.data)
            });
    };

    const stopStream = () => {
        const url = '/api/rpiprocesses/ffmpeg/stop';
        httpService.postData(url, null)
            .catch(error => {
                $scope.isMessagebarVisible = true;
                $scope.messagebarMessage = "Ups! Coś poszło nie tak. Sprawdź połączenie sieciowe."
                console.log("Error while retrieving data: " + error.data)
            });
    };
});