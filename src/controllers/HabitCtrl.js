Strive.controller('HabitCtrl', function( $scope, HabitModel ){

	$scope._init = function(){
			
	}

	$scope.toggleEditMode = function( habit ){
		
		// if we go from editable to 
		// non editable -> we save the 
		// current state of all habits
		habit.isEditable = !habit.isEditable;	
		if( !habit.isEditable ){
			habit.selected = false;	
			HabitModel.edit(habit);
			$scope.selectedHabit = undefined;
			$scope.saveAll();
		}
	}
	$scope.isTickedToday = function( habit ){
		if( !habit.ticks || habit.ticks.length == 0 ) return;
		return new Date(habit.ticks[0].createdAt).isToday();
	}
	$scope.removeHabit = function( habit ){
		HabitModel.remove(habit);
	}
	$scope.createHabit = function( habit ){
		HabitModel.create( habit );
		
		HabitModel.newHabit = undefined;
	}
	$scope.saveAll = function(){
		HabitModel.save()
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
		HabitModel.edit(habit);
	}
	$scope.filterArchived = function(habit){
		return !habit.isArchived;
	}
	$scope.tickHabit = function( habitId ){
		HabitModel.tick( habitId );
	}
	$scope._init();	
});