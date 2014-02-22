var Strive = angular.module('Strive', ['ui.router', 'ClickHide', 'ngAnimate', 'fileSystem', 'JsonStorage']);

Strive.controller('StriveCtrl', function( $scope, StriveModel, StriveHelper ){
	var self = this;
	
	$scope.StriveModel = StriveModel;
	$scope.StriveHelper = StriveHelper;
	
	$scope._init = function(){

		// detect if the app is focused
		window.addEventListener('focus', function(){
		  console.log('onfocus');
		});
		window.addEventListener('blur', function(){
		  console.log('blur');
		});
		window.addEventListener('focusin', function(){
		  console.log('focusin');
		});
		window.addEventListener('focusout', function(){
		  console.log('focusout');
		});
		StriveModel.loadHabits()
			.then(function(){
				StriveModel.recalculateAllStreaks();					
			});
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





