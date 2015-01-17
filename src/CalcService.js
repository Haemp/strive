/**
 * Created by Haemp on 17/01/2015.
 */
(function(){

    angular.module('Strive')
        .service('CalcService', CalcService)


    function CalcService(JsonStorage, $q, Workers, $timeout){
        var lastCalculation;
        var lastCalcHabits = {};

        function _init(){

            JsonStorage.get('strive.CalcService').then(function(d){

                lastCalculation = d ? new Date(d.lastCalculation || 0) : new Date(0);
                lastCalcHabits = d ? d.lastCalcHabits : {};

                // convert to real date objects
                for(var key in lastCalcHabits){
                    if(lastCalcHabits.hasOwnProperty(entry)){
                        lastCalcHabits[key] = new Date(lastCalcHabits[key]);
                    }
                }
            });
        }

        /**
         * Invalidate this habit by setting the lastcalc date
         * to an old date;
         * @param habit
         */
        this.invalidateHabit = function(habit){
            lastCalcHabits[habit.id] = new Date(0);
        }

        this.invalidateAll = function(habit){
            lastCalculation = new Date(0);
        }

        this.recalcHabit = function(habit){

            // dirty check habit
            var d = $q.defer();
            console.log('Recalc all triggered...');
            if(habitIsDirty(habit)){
                _recalcHabit(habit).then(function(){
                    d.resolve({status: 'CalcService.RECALCULATED'});
                })
            }else{
                console.log('Not dirty');
                $timeout(function(){
                    d.resolve({status: 'CalcService.NOT_DIRTY'});
                })
            }
            return d.promise;
        }

        this.recalcAll = function(habits){

            // dirty check habit
            var d = $q.defer();
            console.log('Recalc all triggered...');
            if(allAreDirty()){
                _recalcAll(habits).then(function(){
                    d.resolve({status: 'CalcService.RECALCULATED'});
                });
            }else{

                console.log('Not dirty');
                $timeout(function(){
                    d.resolve({status: 'CalcService.NOT_DIRTY'});
                })
            }
            return d.promise;
        }

        function habitIsDirty(habit){
            var h = lastCalcHabits[habit.id];
            if(h){
                var bestBefore = getBestBeforeCalcDate(lastCalcHabits[h].lastCalc);

                if(new Date().isAfter(bestBefore)){
                    return true;
                }
            }
            return false;
        }

        function allAreDirty(){
            if(lastCalculation){
                var bestBefore = getBestBeforeCalcDate(lastCalculation);

                if(new Date().isAfter(bestBefore)){
                    return true;
                }
            }
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

        function _recalcAll(habits){

            return Workers.postMessage({name: 'recalcAll', habits: habits}).then(function(message){

                var oldHabit;
                message.data.habits.forEach( function(habit){
                    oldHabit = habits.filter(function(h){ return h.id == habit.id })[0];
                    oldHabit.streak = habit.streak;
                    oldHabit.streakRecord = habit.streakRecord;
                    oldHabit.tickedToday = habit.tickedToday;
                })

                lastCalculation = new Date();
                save();
            });
        }

        function _recalcHabit(habit){

            return Workers.postMessage({name: 'recalcHabit', habit: habit}).then(function(message){
                habit.streak = message.data.streak;
                habit.tickedToday = message.data.tickedToday;
                habit.streakRecord = message.data.streakRecord;
                lastCalcHabits[habit.id] = new Date();
                save();
            });
        }

        function save(){
            JsonStorage.save('strive.CalcService', {
                lastCalculation: lastCalculation,
                lastCalcHabits: lastCalcHabits
            });
        }

        _init();
    }
})()