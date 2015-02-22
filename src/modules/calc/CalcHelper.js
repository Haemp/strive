
/**
 * @ngdoc service
 * @name calc.CalcHelper
 */
function _CalcHelper(){

    // fix for Date parsing inconsistencies
    Date.dateParse = Date.parse;
    Date.parse = function(d){
        var r = Date.dateParse(d);
        if(!r) r = new Date(d);
        return r;
    }

    this.checkIfDirty = function(lastCalcTime, todayDate){

        // dynamic today reference
        if(!todayDate)
            todayDate = new Date();

        if(!lastCalcTime || typeof lastCalcTime.getTime != 'function'){
            // assume dirty if date is null or just weird.
            return true;
        }

        var bestBefore = this.getBestBeforeCalcDate(lastCalcTime);
        console.log('Best before date', bestBefore);


        if(todayDate.isAfter(bestBefore)){
            console.log('AllCalcWorkflow: #3a All habits needs to be refreshed', lastCalcTime);
            return true;
        }else{
            console.log('AllCalcWorkflow: #3b It was made recently - this is clean: ', lastCalcTime);
            return false;
        }
    }

    /**
     * Ticked on the same day refers to either the same day
     * or previous days but before 03.00
     */
    this.isTicksOnSameDay = function(tick1, tick2){
        console.log('isTicksOnSameDay');
        var d1 = Date.parse(tick1.createdAt);
        var d2 = Date.parse(tick2.createdAt);

        if( d1.getMonth() != d2.getMonth() ){
            return false;
        }else if( d1.getFullYear() != d2.getFullYear() ){
            return false;
        }
        var d1Date = d1.getDate();
        var d2Date = d2.getDate();
        var d1Hour = d1.getHours();
        var d2Hour = d2.getHours();

        if( Math.abs(d2Date - d1Date) > 1 ) return false;
        if( d1Date == d2Date ){

            // We know they are on the same date - but are they
            // within range of one another?
            if( d1Hour < 3 ){

                // only one day can be ticked before three
                // for it to count as separate days
                if( d2Hour < 3 ){
                    return true;
                }else{
                    return false;
                }

                // D1 is ticked after 03.00
            }else{

                // THey are both over 03.00 - means they are on the
                // same day
                if( d2Hour >= 3 ){
                    return true;
                }else{
                    return false;
                }
            }
        }else{

            // We know they are on different dates - but they
            // could still be on the same strive day. For that
            // to happen the one of the lower date must be ticked
            // after 03.00 and the one of the higher date must
            // be ticked before 03.00
            if( d1Date > d2Date ){
                if( d2Hour >= 3 && d1Hour < 3 ){
                    return true
                }else{
                    return false;
                }
            }else{
                if( d1Hour >= 3 && d2Hour < 3 ){
                    return true
                }else{
                    return false;
                }
            }
        }
    }


    /**
     * Today here means either today or tomorrow to 03.00, since
     * that is the cutof limits for habtis now.
     */
    this.tickedToday = function(habit){
        console.time('tickedToday');
        if( !habit.ticks || habit.ticks.length == 0 ){
            console.timeEnd('tickedToday');
            return false;
        }

        var d = Date.parse(habit.ticks[0].createdAt);
        var now = new Date();
        if( d.isToday() ){

            // If a tick is made today but before three
            // it does not belong to today - it's really yesterday

            if( d.getHours() < 3 ){
                // tick is made between 00 and 03 - this is counted
                // as ticked today only if today is between 00 and 03
                console.timeEnd('tickedToday');
                return now.getHours() < 3;


            }else{
                console.timeEnd('tickedToday');
                return now.getHours() >= 3;
            }

            // if it was yesterday
            // if this calculation is run between 00 -> 03
            // we need to count that as if it were the today.
            // Say the target tick date is 23:00 2 of March. Today
            // is 3 or march 02:00 - this tick should be counted as ticked
            // today
        }else if( d.add(1).day().isToday() && d.getHours() > 3 && now.getHours() < 3 ){
            console.timeEnd('tickedToday');
            return true;
        }else{
            console.timeEnd('tickedToday');
            return false;
        }
    }


    this.newCalcStreak = function(ticks){
        console.time('newCalcStreak');
        var today,
            tick,
            tickDate,
            refDate,
            streak;

        if(!ticks || ticks.length == 0){ console.timeEnd('newCalcStreak'); return 0; }

        streak = 0;
        refDate = _getRefDate(new Date().toString('yyyy-MM-dd HH:mm:ss'));

        for(var i = 0; i < ticks.length; i++){
            tick = ticks[i];
            tickDate = Date.parse(tick.createdAt);
            if(tickDate == null) continue;
            // if the next tick is before the ref date
            // it's a streak
            if(tickDate.isAfter(refDate)){
                streak++;
                // get the next ticks refDate
                refDate = _getRefDate(tick.createdAt);
            }else{
                break;
            }
        }
        console.timeEnd('newCalcStreak');
        return streak;
    }

    this.newCalcStreakRecord = function(ticks){
        console.time('newCalcStreakRecord');
        var streak,
            recordStreak = 0,
            latestTick,
            refDate,
            tick,
            d;

        if(!ticks || ticks.length == 0){ console.timeEnd('newCalcStreakRecord'); return 0; }
        if(ticks.length == 1){ console.timeEnd('newCalcStreakRecord'); return 1; }

        streak = 1;
        latestTick = ticks[0];
        refDate = _getRefDate(latestTick.createdAt);

        for(var i = 1; i < ticks.length; i++){
            tick = ticks[i];
            d = Date.parse(tick.createdAt);

            // if the next tick is before the ref date
            // it's a streak
            if(d && d.isAfter(refDate)){
                streak++;
            }else{
                streak = 1;
            }

            if(streak > recordStreak)
                recordStreak = streak;
            // get the next ticks refDate
            refDate = _getRefDate(tick.createdAt);
        }

        console.timeEnd('newCalcStreakRecord');
        return recordStreak;
    }

    /**
     * A reference day is the latest time which a next comming
     * tick has to be created for it to be counted as a streak.
     */
    function _getRefDate(created){
        var d = Date.parse(created);

        // if the tick happened before 03.00
        // the reference date limit will be
        // the next day at 03.00
        if( d.getHours() < 3 ){
            d.add(-2).day();
        }

        // if the tick happened after 3 the limit
        // will be -2 days at 03.00
        else{
            d.add(-1).days();
        }

        d.set({hour: 3, minute: 0, second: 0, millisecond: 0});

        return d;
    }


    /**
     * Get the date for which the current calculations
     * are no longer valid. This is used in dirty checking
     * @param calcDate
     * @return {object} Date
     */
    this.getBestBeforeCalcDate = function(calcDate){
        if(calcDate.getHours() < 3){
            return new Date(calcDate).set({hour: 3, minute: 0, second:0, millisecond:0})
        }else{
            return new Date(calcDate).add(1).day().set({hour: 3, minute: 0, second:0, millisecond:0})
        }
    }

    this.isDuplicateTick = function(targetTick, ticks){

        for(var i = 0; i < ticks.length; i++){
            // if any of the ticks for this habit is on the
            // same date, month and year as the new ticks
            // we don't want to add it since that makes it a
            // duplicate.
            if( this.isTicksOnSameDay(ticks[i], targetTick) ){
                return true;
            }
        }

        return false;
    }
}

if(typeof angular != 'undefined'){
    angular.module('calc.CalcHelper', [])
        .service('CalcHelper', _CalcHelper)
}
