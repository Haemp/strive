// TODO: figure out what is causing problems with recalc with ticked after 12 habits
// TODO: Integrate calc helper instead of StriveHelper
var Strive = angular.module('Strive', [
	'ui.router',
	'ClickHide',
	'ngAnimate',
	'fileSystem',
	'JsonStorage',
    'calc.CalcHelper',
    'calc.ReCalcService',
	'Basement',
	'AngularSugar',
	'User',
	'SyncModel',
	'Tip',
	'OnBoarding',
	'Recipe',
	'uuid',
	'RemarkableNg',
	'Workers'
]);
var domain = 'http://130.211.52.153:3000';
//var domain = 'http://localhost:3000';

// switch to remote API for production.
Strive.constant('API_DOMAIN', domain);

Strive.config(function($stateProvider, $httpProvider) {

	// We have to set this to true so we're always sending
	// the cookie. This is because we are not requesting
	// from the same domain CORS.
	$httpProvider.defaults.withCredentials = true;


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
		.state('recipes', {

			url: "/recipes",
			views: {
				main: {
					templateUrl: "views/view-recipes.html",
					controller: 'RecipeCtrl'
				}
			}
		})
		.state('recipecreate', {
			url: "/create-recipe",

			views: {
				main:{
					templateUrl: "views/view-create-recipe.html",
					controller: "CreateRecipeCtrl"
				}
			}
		})
		.state('recipeupdate', {
			url: "/update-recipe/:recipeId",

			views: {
				main:{
					templateUrl: "views/view-update-recipe.html",
					controller: "UpdateRecipeCtrl"
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
Strive.constant('DOMAIN', domain);

Strive.run(function(UserOptions) {
	UserOptions.URL_LOGIN = domain+'/api/login';
	UserOptions.URL_EXPORT = domain+'/api/user/import';
	UserOptions.URL_LOGOUT = domain+'/api/logout';
})

Strive.directive('haOnLoad', function($rootScope){
	return {
		compile: function(){
			return {
				post: function(){ console.timeEnd('Init load'); console.log('Init Load');  }
			}
		}
	}
})

Strive.directive('haOnModelLoad', function(StateModel, $state, $timeout){
	return {
		link: function(){
			StateModel.whenLoaded().then(function(){
				console.timeEnd('Model load');
				console.log('Models loaded');

                // slide the splash screen
                var splash = document.querySelector('.Splash');
                splash.classList.add('Splash_finished');

                // trigger first state
                $timeout(function(){
					$state.transitionTo('habits');
                },700);
			})
		}
	}
})
