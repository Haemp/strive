Strive.controller('StriveCtrl', function(
	$scope,
	$state,
	$rootScope,
	HabitModel,
	StriveHelper,
	StateModel,
	MonitorModel,
	Browser,
	UserModel,
	Sync,
	SyncOptions,
	API_DOMAIN,
	asUtility,
	TransactionModel
){
	var self = this;

	$scope.$state = $state;
	$scope.HabitModel = HabitModel;	
	$scope.StateModel = StateModel;
	$scope.StriveHelper = StriveHelper;
	$scope.UserModel = UserModel;

	$scope._init = function(){
		SyncOptions.onSyncSuccess = function(){
			TransactionModel.clear();
		}
		// SyncOptions.downSync = {
		// 	url:API_DOMAIN+'/api/user/down-sync',
		// 	method: 'GET',
		// 	withCredentials: true
		// }	
		
		// SyncOptions.onDownSyncComplete = function(data){
		// 	var habitChanges = HabitModel.merge(data.habits);
		// 	var monitorChanges = MonitorModel.merge(data.monitors);

		// 	console.log('Habit Changes: ', habitChanges);
		// 	console.log('Monitor Changes: ', monitorChanges);
		// }
		// 
		asUtility.pollFunction(function(){

			var transactions = TransactionModel.transactions;
			Sync.batch({
				url: API_DOMAIN+'/api/commands',
				method: 'POST',
				data: transactions
			});
		}, 10000)
		
		Sync.syncAuto();


		
		// make sure we clear the Sync buffer when
		// there is a new user
		$rootScope.$on('User.SIGNUP_SUCCESS', self.newUserRoutine)
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
				HabitModel.recalculateAllStreaks();
			});
		}

		HabitModel.loadHabits()
			.then(function(){
				HabitModel.recalculateAllStreaks();
			});
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

	self.newUserRoutine = function(e, data){

		// reset the Sync
		Sync.requests.length = 0;
		
		// trigger a data import 
		$rootScope.$emit('User.EXPORT_PROGRESS', {text: 'Exporting your marklar', type: 'progress'});
		UserModel.export( HabitModel.habits, MonitorModel.monitors )
			.then(function(res){

				// TODO activate the sync
				$rootScope.$emit('User.EXPORT_SUCCESS', {text: 'All your marklars was successfully markared!', type: 'success'});
			}, function(res){
				$rootScope.$emit('User.EXPORT_SUCCESS', {text: 'We\'re sorry, your marklars could not be fully marklared :(', type: 'error'});
			});
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
