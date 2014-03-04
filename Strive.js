var Strive = angular.module('Strive', ['ui.router', 'ClickHide', 'ngAnimate', 'fileSystem', 'JsonStorage']);

Strive.controller('StriveCtrl', function( $scope, StriveModel, StriveHelper, StateModel ){
	var self = this;
	
	$scope.StriveModel = StriveModel;
	$scope.StateModel = StateModel;
	$scope.StriveHelper = StriveHelper;
	
	$scope._init = function(){

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
	$scope.toggleEditMode = function( habit ){
		
		// if we go from editable to 
		// non editable -> we save the 
		// current state of all habits
		habit.isEditable = !habit.isEditable;	
		if( !habit.isEditable ){
			habit.selected = false;	
			$scope.saveAll();
		}
	}
	$scope.isTickedToday = function( habit ){
		if( !habit.ticks ) return;
		
		return new Date(habit.ticks[0].createdAt).isToday();
	}
	$scope.removeHabit = function( habit ){
		StriveModel.remove(habit);
	}
	$scope.createHabit = function( habit ){
		StriveModel.create( habit );
		
		StriveModel.newHabit = undefined;
	}
	$scope.saveAll = function(){
		StriveModel.save()
	}
	$scope.selectHabit = function( habit ){
		if( $scope.selectedHabit )
			$scope.selectedHabit.selected = false;
		
		if( $scope.selectedHabit != habit ){
			habit.selected = true;
			$scope.selectedHabit = habit;	
		}else{
			$scope.selectedHabit = undefined;
		}
	}
	$scope.tickHabit = function( habitId ){
		StriveModel.tick( habitId );
	}
	$scope._init();
});





