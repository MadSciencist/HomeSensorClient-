app.controller("StreamController", function ($scope, httpService) {
    const baseUrl = '/api/streamingdevices/';
    $scope.isMessagebarVisible = false;
    $scope.messagebarMessage = '';
    $scope.playerSettings = '{"fluid": true}';
    $scope.streams = {};
    $scope.selectedStreamKey;
    $scope.noStreams = false;

    $scope.initController = function () {
        getAllStreams();
    };

    $scope.startStream = () => beginStream();
    $scope.stopStream = () => stopStream();

    const getAllStreams = () => {
        httpService.getData(baseUrl)
            .then(response => {
                if (response.data.length === 0) {
                    $scope.noStreams = true;
                    return;
                }
                $scope.streams = response.data.map(i => {
                    return {
                        text: i.name,
                        key: i.id,
                        url: i.connectionString,
                    }
                })
                $scope.selectedStreamKey = $scope.streams[0].key;
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
            .catch(error => {
                $scope.isMessagebarVisible = true;
                $scope.messagebarMessage = "Ups! Coś poszło nie tak. Sprawdź połączenie sieciowe."
                console.error("Error while retrieving data: " + error.data)
            });
    };

    const stopStream = () => {
        const url = '/api/rpiprocesses/ffmpeg/stop';
        httpService.postData(url, {})
            .catch(error => {
                $scope.isMessagebarVisible = true;
                $scope.messagebarMessage = "Ups! Coś poszło nie tak. Sprawdź połączenie sieciowe."
                console.error("Error while retrieving data: " + error.data)
            });
    };
});