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


	.directive('habit', function(HabitModel, StriveHelper, StateModel, StriveNotifications, $rootScope, AnimService){
		return{
			restrict: 'E',
			scope:{
				habit: '=?'
			},
			templateUrl: 'src/modules/habit/habit.html',
			link: function(scope){
				
				scope.StriveHelper = StriveHelper;
				scope.StateModel = StateModel;

				scope.toggleEditMode = function(habit){
					HabitModel.toggleEditMode(habit);
					StriveNotifications.refreshOverview();
				}
				scope.selectHabit = HabitModel.selectHabit;
				scope.isTickedToday = StriveHelper.tickedToday;

				scope.archive = function(habit){
					HabitModel.archive(habit);
					StriveNotifications.refreshOverview();
				}
				scope.unArchive = function(habit){
					HabitModel.unArchive(habit);
					StriveNotifications.refreshOverview();
				}
				
				scope.removeHabit = function(habit){
					HabitModel.removeHabit(habit);
					StriveNotifications.refreshOverview();
				}

				scope.tickHabit = function( habitId ){

					// here we to keep inline with the 60fps we need
					// to trigger the animation before we know the real streak.
					// So we fake it here by just incrementing one
					scope.triggerFlip = true;
					if(scope.habit.streak)
						scope.habit.streak++;
					else
						scope.habit.streak = 1;

					// when the animation ends we trigger the calculation of
					// the new streak
					AnimService.onAnimEnd('flip').then(function(){
						scope.noBorder = true;
						return HabitModel.tickHabit( {habitId:habitId} );
					}).then(function(){

						StriveNotifications.refreshOverview();
					})
					// wait for animation then calc
					
				}
				
			}
		}
	})

})()