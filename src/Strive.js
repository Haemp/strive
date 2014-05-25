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
	'Sync'
]);

// switch to remote API for production.
Strive.constant('API_DOMAIN', 'http://localhost:3000');

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



Strive.run(function(UserOptions) {
	UserOptions.URL_LOGIN = 'http://localhost:3000/api/login';
	UserOptions.URL_EXPORT = 'http://localhost:3000/api/user/import';
})