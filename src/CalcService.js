/**
 * Created by Haemp on 17/01/2015.
 */
(function(){

    angular.module('Strive')
        .service('CalcService', CalcService)
    

    function CalcService(JsonStorage, $q, Workers, $timeout){
        var lastCalculation;

        function _init(){
            JsonStorage.get('strive.CalcService').then(function(d){
                lastCalculation = d ? new Date(d.lastCalculation || 0) : new Date(0);
            });
        }

        this.invalidateAll = function(habit){
            lastCalculation = new Date(0);
        }

        this.recalcHabit = function(habit){
            console.log('HabitCalcWorkflow: #2 Sending habit to worker to recalculate');
            return Workers.postMessage({name: 'recalcHabit', habit: habit}).then(function(message){

                console.log('HabitCalcWorkflow: #5 Receiving calculated values, assigning it to the local habit...');
                habit.streak = message.data.streak;
                habit.tickedToday = message.data.tickedToday;
                habit.streakRecord = message.data.streakRecord;
                console.log('HabitCalcWorkflow: #6 Finished!');
            });
        }

        this.recalcAll = function(habits){

            // dirty check habit
            var d = $q.defer();
            console.log('AllCalcWorkflow: #2 Attempting to recalc habits...');
            if(allAreDirty()){
                _recalcAll(habits).then(function(){
                    d.resolve({status: 'CalcService.RECALCULATED'});
                });
            }else{
                console.log('AllCalcWorkflow: #4 Habits are not dirty - no action required');
                $timeout(function(){
                    d.resolve({status: 'CalcService.NOT_DIRTY'});
                })
            }
            return d.promise;
        }

        function _recalcAll(habits){

            console.log('AllCalcWorkflow: #5 Sending habits to the worker thread to be calculated');
            return Workers.postMessage({name: 'recalcAll', habits: habits}).then(function(message){

                console.log('AllCalcWorkflow: #8 Recieced habits from worker - now looping through and setting streak, streak reccord and tickedToday');
                var oldHabit;
                message.data.habits.forEach( function(habit){
                    oldHabit = habits.filter(function(h){ return h.id == habit.id })[0];
                    oldHabit.streak = habit.streak;
                    oldHabit.streakRecord = habit.streakRecord;
                    oldHabit.tickedToday = habit.tickedToday;
                })

                lastCalculation = new Date();
                save();
                console.log('AllCalcWorkflow: #9 Done! Now saving the last calculation time: ', lastCalculation);
            });
        }

        function allAreDirty(){

            console.log('AllCalcWorkflow: #3 Checking when the last calculation was made');
            if(lastCalculation){
                var bestBefore = getBestBeforeCalcDate(lastCalculation);

                if(new Date().isAfter(bestBefore)){
                    console.log('AllCalcWorkflow: #3a All habits needs to be refreshed');
                    return true;
                }
            }

            console.log('AllCalcWorkflow: #3b It was made recently - this is clean');
            return false;
        }

        /**
         * Get the date for which the current calculations
         * are no longer valid. This is used in dirty checking
         * @param calcDate
         * @return {object} Date
         */
        function getBestBeforeCalcDate(calcDate){
            if(calcDate.getHours() < 3){
                return new Date(calcDate).set({hour: 3, minute: 0, second:0, millisecond:0})
            }else{
                return new Date(calcDate).add(1).day().set({hour: 3, minute: 0, second:0, millisecond:0})
            }
        }

        function save(){
            JsonStorage.save('strive.CalcService', {
                lastCalculation: lastCalculation
            });
        }

        _init();
    }
})()