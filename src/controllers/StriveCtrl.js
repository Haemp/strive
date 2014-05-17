Strive.controller('StriveCtrl', function(
	$scope,
	$state,
	$rootScope,
	StriveModel,
	StriveHelper,
	StateModel,
	Browser
){
	var self = this;

	$scope.$state = $state;
	$scope.StriveModel = StriveModel;
	$scope.StateModel = StateModel;
	$scope.StriveHelper = StriveHelper;

	$scope._init = function(){



		// load in separate stylesheet for
		// the pre-kitkat android browser.
		yepnope([{ test: Browser.isAndroid, yep: 'styles/android.css' }]);

		$state.go('habits');

		// handling backwards button
		$rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {


			// if the state change is a change backwards
			// we just shift the top state
			if( StateModel.states.length < 1 ){
				StateModel.states.unshift(from);
			}else if(StateModel.states[0].name == to.name){
				StateModel.states.shift();
			}else{
				StateModel.states.unshift(from);
			}
		});



		document.addEventListener("touchstart", function(){}, true);
		document.addEventListener("mouseover", function(){}, true);

		document.addEventListener("backbutton", function(){
			console.log('Backbutton was pressed');
			$scope.back();
		});

		// skip the 300ms delay
		FastClick.attach(document.body);

		// if the app is resumed as a focused activity
		// this event is called and we then make an attempt
		// at recalculating the streaks. The usecase here is
		// when a user resumes the app after a new day has passed,
		// if we don't recalculate the streaks there will be no
		// checkmarks to tick
		if( typeof chrome != 'undefined' && chrome.runtime && chrome.runtime.onSuspendCanceled ){
			chrome.runtime.onSuspendCanceled.addListener(function(){
				StriveModel.recalculateAllStreaks();
			});
		}

		StriveModel.loadHabits()
			.then(function(){
				StriveModel.recalculateAllStreaks();
			});
	}

	/**
	 * Brings up the login view in a separate panel
	 */
	$scope.login = function(){
		
		/*chrome.identity.getAuthToken({interactive:true}, function(e){
			console.log('auth token', e);
		});*/
	}

	$scope.switch = function( state ){
		$state.transitionTo(state);
		StateModel.basementOpen = false;
	}
	$scope.back = function(){
		if( StateModel.states.length < 2 ) return; // if there is just one state we stop

		console.log('Going back', StateModel.states[0].name);
		$state.go(StateModel.states[0].name);
	}
	$scope._init();
});


Strive.directive('autoTop', function( $rootScope, $timeout ){

	return{
		link: function( $scope, element, attr ){

			$rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
				$timeout(function(){
					$('body').scrollTop(0);
					console.log('Setting scroll');
				}, 100);

			});
		}
	}
});
