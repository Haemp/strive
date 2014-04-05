Strive.controller('HabitCtrl', function( $scope, StriveModel ){

	$scope._init = function(){
			
	}

	$scope.toggleEditMode = function( habit ){
		
		// if we go from editable to 
		// non editable -> we save the 
		// current state of all habits
		habit.isEditable = !habit.isEditable;	
		if( !habit.isEditable ){
			habit.selected = false;	
			$scope.selectedHabit = undefined;
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
		if( $scope.selectedHabit ){
			$scope.selectedHabit.selected = false;
			$scope.selectedHabit.isEditable = false;
			$scope.selectedHabit.confirmDelete = false;
		}
			
		
		if( $scope.selectedHabit != habit ){
			habit.selected = true;
			$scope.selectedHabit = habit;	
		}else{
			$scope.selectedHabit = undefined;
		}
	}
	$scope.archive = function( habit ){
		habit.isArchived = true;
		$scope.saveAll();
	}
	$scope.filterArchived = function(habit){
		return !habit.isArchived;
	}
	$scope.tickHabit = function( habitId ){
		StriveModel.tick( habitId );
	}
	$scope._init();	
});