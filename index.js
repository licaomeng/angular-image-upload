angular.module('appModule', ['ui.router'])
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            console.log("angular route start..");
            $urlRouterProvider.otherwise('/main');
        }
    ])