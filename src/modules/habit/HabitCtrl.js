(function(){

	angular.module('Strive')

	.controller('HabitCtrl', function( $scope, HabitModel, StriveNotifications ){
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
		
		$scope.createHabit = function( habit ){
			HabitModel.createHabit( habit );
			
			HabitModel.newHabit = undefined;
			StriveNotifications.refreshOverview();
		}
		$scope.saveAll = function(){
			HabitModel.save();
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
		
		$scope.filterArchived = function(habit){
			return !habit.isArchived;
		}
		$scope.tickHabit = function( habitId ){



			HabitModel.tickHabit( {habitId:habitId} );
		}

		$scope._init();	
	})


})()