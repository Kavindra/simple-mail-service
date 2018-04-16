(function() {
    'use strict';

    angular
        .module('simpleChat')
        .controller('MainController', MainController);

    MainController.$inject = ['$rootScope', '$scope', '$window', 'SendMailService'];
    function MainController($rootScope, $scope, $window, SendMailService) {
        // scope and global variables.
        $scope.toEmail = '';
        $scope.fromEmail = '';
        $scope.subject = '';
        $scope.ccEmail = '';
        $scope.bccEmail = '';
        $scope.mailBody = '';
        $scope.responseMessage = '';

        $scope.sendEmail = function () {
            var emailObj = {
                fromMail: $scope.fromEmail,
                tomail: $scope.toEmail,
                subject: $scope.subject,
                cc: $scope.ccEmail,
                bcc: $scope.bccEmail,
                body: $scope.mailBody
            };

            SendMailService.sendMail(emailObj).then(function(response) {
                $scope.responseMessage = 'Successfully sent email to ' + response.data.email;
            }, function(error) {
                $scope.responseMessage = 'An error occurred while sending email.'
            });
        }

    }
})();

