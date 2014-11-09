console.time('Init load');
console.time('Model load');
var Strive = angular.module('Strive', [
	'ui.router',
	'ClickHide',
	'ngAnimate',
	'fileSystem',
	'JsonStorage',
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
//var domain = 'http://130.211.52.153:3000';
var domain = 'http://localhost:3000';

// switch to remote API for production.
Strive.constant('API_DOMAIN', domain);

Strive.config(function($stateProvider, $httpProvider) {

	// SyncOptionsProvider.setOptions({
	// 	pollInterval: 5000,
	// 	flushInterval: 5000,
	// 	pollUrl: 'http://localhost:3000/login'
	// });

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

Strive.directive('haOnModelLoad', function(StateModel, $state){
	return {
		link: function(){
			StateModel.whenLoaded().then(function(){
				console.timeEnd('Model load');
				console.log('Models loaded');
				var splash = document.querySelector('.Splash');
				splash.animate([
					{transform: 'translateX(0)'},
					{transform: 'translateX(-100%)'}
				], { duration: 500, easing: 'ease' }).onfinish = function(){
					splash.style.transform = 'translateX(-100%)';
					
					$state.transitionTo('recipes');
				}

			})
		}
	}
})
