/**
 * Created by licao on 2017/6/23.
 */
angular.module('appModule')
    .controller('mainCtrl', ['$scope', function ($scope) {
        $scope.upload = function (image, isDelete, isHasAvatar) {
            alert("uploading...");
        }
    }])
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider.state('main', {
                url: '/main',
                views: {
                    'main': {
                        templateUrl: './main.html',
                        controller: 'mainCtrl'
                    }
                }
            });
        }]);