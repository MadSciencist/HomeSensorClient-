app.service('httpService', function ($http) {
    this.getData = function (url) {
        console.log('GET data from: ' + url);
        return $http.get(url,
            {
                headers: {
                    'Authorization': 'Bearer '.concat(localStorage.getItem('token')),
                    'Content-Type': 'application-json; charset=UTF-8'
                }
            });
    };

    this.putData = function (url, data) {
        console.log('PUT data to: ' + url + ' using data:')
        console.log(data);
        return $http.put(url, data, {
            headers: {
                'Authorization': 'Bearer '.concat(localStorage.getItem('token')),
                'Accept': 'application-json'
            }
        });
    };

    this.postData = function (url, data) {
        console.log('POST data to: ' + url + ' using data:')
        console.log(data);
        return $http.post(url, data, {
            headers: {
                'Authorization': 'Bearer '.concat(localStorage.getItem('token')),
                'Accept': 'application-json'
            }
        });
    };

    this.deleteData = function (url) {
        console.log('DELETE data to: ' + url)
        return $http.delete(url, {
            headers: {
                'Authorization': 'Bearer '.concat(localStorage.getItem('token')),
                'Accept': 'application-json'
            }
        });
    };
});