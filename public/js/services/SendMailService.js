angular.module('SendMailService', []).factory('SendMailService', ['$http', function($http) {

    return {
        /*
        * send request to the server to send the email.
        * */
        sendMail : function(data) {
            console.log(data);
            return $http.post('/send', data);
        }
    }       

}]);