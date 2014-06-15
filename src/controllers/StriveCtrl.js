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
	API_DOMAIN,
	asUtility,
	TransactionModel,
	SyncModel,
	TipModel
){
	var self = this;

	$scope.$state = $state;
	$scope.HabitModel = HabitModel;	
	$scope.StateModel = StateModel;
	$scope.StriveHelper = StriveHelper;
	$scope.TransactionModel = TransactionModel;
	$scope.UserModel = UserModel;
	$scope.TipModel = TipModel;
	
	$scope.basementState = { logoutPopup: false };
	$scope.sync = function(){
		SyncModel.sync();
	}

	$scope._init = function(){

		// initialize data from localStorage
		HabitModel.loadHabits()
			.then(function(){
				HabitModel.recalculateAllStreaks();
			});
		MonitorModel.loadMonitors();

		// on sync - every 30s
		$rootScope.$on('SyncModel.SYNC_COMPLETE', function(e, data){
			
			// check played transactions
			if( data.transactions && data.transactions.length > 0 ){
				
				console.log('Updating data after new incomming transactions');
				// update habits, monitors and data points.
				MonitorModel.sort();
				HabitModel.sort();
				HabitModel.recalculateAllStreaks();
			}
		})
		
		// make sure we clear the Sync buffer when
		// there is a new user
		$rootScope.$on('User.LOGIN_SUCCESS', function(){
			SyncModel.sync();
		})
		
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


		
		
		// start the sync loop on 30s
		asUtility.pollFunction(function(){
			SyncModel.sync();
		}, 30*1000)
	}

	$scope.switch = function( state ){
		$state.transitionTo(state);
		StateModel.basementOpen = false;
	}
	
	$scope.clear = function(){
		HabitModel.clear();
		MonitorModel.clear();
	}
	$scope.back = function(){
		if( StateModel.states.length < 2 ) return; // if there is just one state we stop

		console.log('Going back', StateModel.states[0].name);
		$state.go(StateModel.states[0].name);
	}
	
	$scope.logout = function(){
		
		HabitModel.clear();
		MonitorModel.clear();
		TransactionModel.clear();
		UserModel.logout()
			.then(function(){
				$scope.basementState.logoutPopup = false;
			});
	}
	
	$scope.logoutConfirm = function($event, status){
		console.log('logoutPopup is: ',$scope.basementState.logoutPopup);
		$event.stopImmediatePropagation();
		$scope.basementState.logoutPopup = status;
		console.log('logoutPopup is: ',$scope.basementState.logoutPopup);
	}
	self.newUserRoutine = function(e, data){

		// A new user has been created,
		// we check if the user has any transaction data
		console.log('New user routine');
		if( TransactionModel.isEmpty() ){

			console.log('Transmodel is empty');
			// if there is no transaction data we have this for the
			// case that the user is a legacy user that has not
			// activated the transactions. In which case we need to push
			// the data up in to the imported instead of just relying on
			// the transactions.
			if(HabitModel.habits.length > 0 || MonitorModel.monitors.length > 0){
				
				console.log('There are habits and or monitors');
				$rootScope.$emit('User.EXPORT_PROGRESS', {text: 'Exporting your marklar', type: 'progress'});
				console.log('Export in progress');
				UserModel.export( HabitModel.habits, MonitorModel.monitors )
					.then(function(res){
						console.log('Export succeeded');
						// set the transaction version
						TransactionModel.setVersion(res.data.syncVersion);

						// TODO activate the sync
						$rootScope.$emit('User.EXPORT_SUCCESS', {text: 'All your marklars was successfully markared!', type: 'success'});
					}, function(res){
						$rootScope.$emit('User.EXPORT_SUCCESS', {text: 'We\'re sorry, your marklars could not be fully marklared :(', type: 'error'});
					});
			}
		}else{
			SyncModel.sync();
		}
		
		// trigger a data import 
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
