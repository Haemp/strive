var Strive = angular.module('Strive', [
	'ui.router',
	'ClickHide',
	'ngAnimate',
	'fileSystem',
	'JsonStorage',
	'Basement',
	'AngularSugar',
	'ngCookies',
	'User',
	'SyncModel'
]);
var domain = 'http://146.148.22.101:3000';
//var domain = 'http://localhost:3000';

// switch to remote API for production.
Strive.constant('API_DOMAIN', domain);

Strive.config(function($stateProvider, $httpProvider) {

	// SyncOptionsProvider.setOptions({
	// 	pollInterval: 5000,
	// 	flushInterval: 5000,
	// 	pollUrl: 'http://localhost:3000/login'
	// });

	$stateProvider
		.state('habits', {
			url: "/habits",
			views: {
				main: {
					templateUrl: "views/view-habits.html",
					controller: 'HabitCtrl'
				}
			}
		})
		.state('monitors', {
			url: "/monitors",
			views: {
				main: {
					templateUrl: "views/view-monitors.html",
					controller: 'MonitorCtrl'
				}
			}
		})
		.state('archived', {
			url: "/archived",
			views: {
				main: {
					templateUrl: "views/view-archive.html",
					controller: 'ArchiveCtrl'
				}
			}
		})


	$httpProvider.interceptors.push('userInterceptor');

});

Strive.constant('URL_SYNC', domain+'/api/commands');

Strive.run(function(UserOptions) {
	UserOptions.URL_LOGIN = domain+'/api/login';
	UserOptions.URL_EXPORT = domain+'/api/user/import';
})