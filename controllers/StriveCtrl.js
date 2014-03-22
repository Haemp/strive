Strive.controller('StriveCtrl', function( 
	$scope, 
	$state,
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

		
		yepnope([{
			test: Browser.isAndroid,
			yep: 'styles/android.css'
		}]);

		$state.transitionTo('habits');

		document.addEventListener("touchstart", function(){}, true);
		document.addEventListener("mouseover", function(){}, true);
		
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
	
	$scope.switch = function( state ){
		$state.transitionTo(state);
		StateModel.basementOpen = false;
	}
	
	$scope._init();
});
