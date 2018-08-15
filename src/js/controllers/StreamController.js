app.controller("StreamController", function ($scope, httpService) {
    $scope.isMessagebarVisible = false;
    $scope.messagebarMessage = '';
    $scope.playerSettings = '{"fluid": true}';
    $scope.streamSource = 'http://192.168.0.200:8083/hls/stream.m3u8';
    $scope.selectedStream = 'ley1';
    $scope.streams = [{
        value: 'ley1',
        dictionary: 'asss1',
        url: ''
    }, {
        value: 'ley2',
        dictionary: 'asss2',
        url: ''
    },
    {
        value: 'ley3',
        dictionary: 'asss3',
        url: ''
    }];


    $scope.initController = function() {
        //TODO
        // const url = '/api/streams/';
        // httpService.getData(url)
        // .then(response => {
        //     console.log(response);
        // })
        // .catch(error => console.log("Error while retrieving data: " + error)
        // );
    };

    $scope.startStream = function () {
        manageStreamService('start');
    };

    $scope.stopStream = function () {
        manageStreamService('stop');
    };

    const manageStreamService = function(state){
        const url = '/api/rpiprocesses/ffmpeg/'.concat(state);
        httpService.getData(url)
        .then(response => {
            console.log(response);
        })
        .catch(error => {
            $scope.isMessagebarVisible = true;
            $scope.messagebarMessage = "Ups! Coś poszło nie tak. Sprawdź połączenie sieciowe."
            console.log("Error while retrieving data: " + error)}
        );
    };   
});