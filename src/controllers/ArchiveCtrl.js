Strive.controller('ArchiveCtrl', function( $scope, HabitModel ){

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
		if( !habit.ticks || habit.ticks.length < 1 ) return;
		
		return new Date(habit.ticks[0].createdAt).isToday();
	}
	$scope.removeHabit = function( habit ){
		HabitModel.remove(habit);
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
	$scope.unArchive = function( habit ){
		habit.isArchived = false;
		$scope.saveAll();
		HabitModel.edit(habit);
	}
	$scope.showArchived = function(habit){
		return habit.isArchived;
	}
	
	$scope._init();	
});