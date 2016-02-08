/**
 * Simple scaled down habit with only the name and description
 */
(function(){

	angular.module('Strive')

	.directive('habitPublic', function(HabitModel){
		return{
			restrict: 'E',
			scope:{
				habit: '=?'
			},
			templateUrl: 'habit-public.html',
			link: function(scope){
				scope.selectHabit = HabitModel.selectHabit;
			}
		}
	})

})()