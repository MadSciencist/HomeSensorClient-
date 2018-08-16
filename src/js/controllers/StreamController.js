app.controller("StreamController", function ($scope, httpService) {
    const baseUrl = '/api/streamingdevices/';
    $scope.isMessagebarVisible = false;
    $scope.messagebarMessage = '';
    $scope.playerSettings = '{"fluid": true}';
    $scope.streamUrl = '';
    $scope.streams = {};
    $scope.selectedStreamKey = '';

    $scope.initController = function () {
        getAllStreams();
    };

    $scope.startStream = () => beginStream();
    $scope.stopStream = () => stopStream();

    $scope.streamChanged = function (o) {
        const selectedStream = $scope.streams.filter(s => s.key === $scope.selectedStreamKey)[0];
        $scope.selectedStreamKey = selectedStream.key;
        $scope.streamUrl = selectedStream.url;
        $scope.streamDescription = selectedStream.description;
    };

    const getAllStreams = function () {
        httpService.getData(baseUrl)
            .then(response => {
                $scope.streams = response.data.map(i => ({
                    dictionary: i.name,
                    key: i.name,
                    url: i.connectionString,
                    description: i.description
                }))
                $scope.selectedStreamKey = $scope.streams[0].key;
                $scope.streamUrl = $scope.streams[0].url;
                $scope.streamDescription = $scope.streams[0].description;
            })
            .catch(error => {
                console.log('Wystapił błąd: ' + error);
            });
    };

    const beginStream = function (streamKey) {

        //TODO post a stream id to hide its url and credentials
        const url = '/api/rpiprocesses/ffmpeg/start';
        const data = JSON.stringify({
            Url: $scope.streamUrl
        });

        httpService.postData(url, data)
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                $scope.isMessagebarVisible = true;
                $scope.messagebarMessage = "Ups! Coś poszło nie tak. Sprawdź połączenie sieciowe."
                console.log("Error while retrieving data: " + error)
            });
    };

    const stopStream = function () {
        const url = '/api/rpiprocesses/ffmpeg/stop';

        httpService.postData(url, null)
            .catch(error => {
                $scope.isMessagebarVisible = true;
                $scope.messagebarMessage = "Ups! Coś poszło nie tak. Sprawdź połączenie sieciowe."
                console.log("Error while retrieving data: " + error)
            });
    };
});