(function () {
    angular.module('Strive')
        .directive('habit', habit)

        function habit(HabitModel, StriveHelper, StateModel, StriveNotifications, $rootScope, AnimService){
            return{
                restrict: 'E',
                scope:{
                    habit: '=?'
                },
                templateUrl: '../habit/habit.html',
                link: function(scope){

                    scope.StriveHelper = StriveHelper;
                    scope.StateModel = StateModel;

                    scope.toggleEditMode = function(habit){
                        HabitModel.toggleEditMode(habit);
                        StriveNotifications.refreshOverview();
                    }
                    scope.selectHabit = HabitModel.selectHabit;

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
        }
})()
