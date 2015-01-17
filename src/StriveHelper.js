

function _StriveHelper(){
	var self = this;

	// fix for Date parsing inconsistencies
	Date.dateParse = Date.parse;
	Date.parse = function(d){
		var r = Date.dateParse(d);
		if(!r) r = new Date(d);
		return r;
	}

	self.getStreakIcon = function( streak ){

		if( streak >= 100 ){
			return 'gold';
		}else if( streak >= 50 ){
			return 'orange';
		}else if( streak >= 20 ){
			return 'purple';
		}else if( streak >= 7 ){
			return 'blue';
		}else if( streak >= 3){
			return 'green';
		}else if( streak > 0){
			return 'gray';
		}
	}

	/**
	* Calculate the highest of all streak
	* how many days in a row have this habit
	* been ticked
	*
	* @param object Habit
	*/
	// self.calculateStreakRecord = function( habit ){

	// 	// get the last added tick
	// 	var ticks = habit.ticks;
	// 	if( ticks < 1 ) return 0;
	// 	var recordStreak = 0;
	// 	var lastTickDate = new Date(ticks[0].createdAt);
	// 	var streak = 0;
	// 	var tick;


	// 	// loop through all the tick from the latest
	// 	// entries to the last. We parrallelly loop
	// 	// through the lastTickDate one day at a time
	// 	// and see that there exists a tick for
	// 	// each day.
	// 	for (var i = 0; i < ticks.length; i++) {
	// 		tick = ticks[i];

	// 		// do we have a tick for this day
	// 		if( new Date(tick.createdAt).getDate() == lastTickDate.getDate() ){
	// 			streak++;

	// 			// decrement the lastTickDate
	// 			lastTickDate.add(-1).days();

	// 		// there is no tick for this day
	// 		// aka we broke the streak - now we
	// 		// record how high the streak was
	// 		// and continue on.
	// 		}else{

	// 			console.log('Streak end', streak);
	// 			if( streak > recordStreak ){
	// 				recordStreak = streak;
	// 			}
	// 			streak = 1;

	// 			// set the new lastTickDate to
	// 			// the current ticks date - this
	// 			// is where it starts again.
	// 			if(i < ticks.length-1){
	// 				lastTickDate = new Date(ticks[i+1].createdAt);
	// 				console.log('New streak starts', lastTickDate);	
	// 			}
				
	// 		}

	// 	}

	// 	if( streak > recordStreak ){
	// 		recordStreak = streak;
	// 	}

	// 	// return the highest number
	// 	return recordStreak;
	// }

	// self.calculateStreak = function( ticks ){
	// 	if(!ticks || ticks.length == 0) return 0;
	// 	// is the lastest tick from today or yesterday
	// 	// then start counting streaks
	// 	var latestTick = ticks[0];
	// 	var latestTickTime = new Date(latestTick.createdAt);
	// 	var today = new Date();
	// 	var yesterday = new Date().add(-1).days();
	// 	yesterday.set({hour:0, minute:0, second:0, millisecond:0});

	// 	if( !latestTickTime.isAfter(yesterday) )
	// 		return 0;

	// 	// how many days in a row have this habit
	// 	// been ticked
	// 	var lastTick = new Date(ticks[0].createdAt);
	// 	var streak = 1;
	// 	for (var i = 1; i < ticks.length; i++) {
	// 		var tick = ticks[i];
	// 		if( new Date(tick.createdAt).getDate() == lastTick.add(-1).days().getDate() )
	// 			streak++;
	// 		else
	// 			break;
	// 	}

	// 	return streak;
	// }

	/**
	 * Ticked on the same day refers to either the same day
	 * or previous days but before 03.00
	 */
	self.isTicksOnSameDay = function(tick1, tick2){
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

	
	self.newCalcStreak = function(ticks){
		console.time('newCalcStreak');
		var today,
			tick,
			tickDate,
			refDate,
			streak;

		if(!ticks || ticks.length == 0){ console.timeEnd('newCalcStreak'); return 0; }

		streak = 0;
		refDate = self._getRefDate(new Date().toString('yyyy-MM-dd HH:mm:ss'));
		
		for(var i = 0; i < ticks.length; i++){
			tick = ticks[i];
			tickDate = Date.parse(tick.createdAt);
			if(tickDate == null) continue;
			// if the next tick is before the ref date
			// it's a streak
			if(tickDate.isAfter(refDate)){
				streak++;	
				// get the next ticks refDate
				refDate = self._getRefDate(tick.createdAt);
			}else{
				break;
			}
		}	
		console.timeEnd('newCalcStreak');
		return streak;
	}

	self.newCalcStreakRecord = function(ticks){
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
		refDate = self._getRefDate(latestTick.createdAt);
		
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
			refDate = self._getRefDate(tick.createdAt);
		}	
		
		console.timeEnd('newCalcStreakRecord');
		return recordStreak;
	}
	
	/** 
	 * A reference day is the latest time which a next comming
	 * tick has to be created for it to be counted as a streak.
	 */
	self._getRefDate = function(created){
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

}

if( typeof angular != 'undefined' ){
	Strive.service('StriveHelper', _StriveHelper);
}
