Strive.controller('HabitCtrl', function( $scope, HabitModel ){
	var self = this;
	$scope._init = function(){
			
	}
	
	$scope.toggleEditMode = function( habit ){
		
		// if we go from editable to 
		// non editable -> we save the 
		// current state of all habits
		habit.isEditable = !habit.isEditable;	
		if( !habit.isEditable ){
			habit.selected = false;	
			HabitModel.editHabit(self._edit(habit));
			$scope.selectedHabit = undefined;
			$scope.saveAll();
		}
	}
	$scope.isTickedToday = function( habit ){
		return HabitModel.tickedToday(habit);
	}
	$scope.removeHabit = function( habit ){
		HabitModel.removeHabit(habit);
	}
	$scope.createHabit = function( habit ){
		HabitModel.createHabit( habit );
		
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
		
		HabitModel.editHabit(self._edit(habit));
	}
	$scope.filterArchived = function(habit){
		return !habit.isArchived;
	}
	$scope.tickHabit = function( habitId ){
		HabitModel.tickHabit( {habitId:habitId} );
	}

	self._edit = function(habit){
		var edited = angular.copy(habit);
		delete edited.ticks;
		return edited;
	}
	$scope._init();	
});