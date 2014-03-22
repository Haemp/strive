var Strive = angular.module('Strive', [
	'ui.router', 
	'ClickHide', 
	'ngAnimate', 
	'fileSystem', 
	'JsonStorage', 
	'Basement',
	'AngularSugar'
]);

Strive.config(function( $stateProvider ){
	
	$stateProvider.state('habits', {
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
    });
});



