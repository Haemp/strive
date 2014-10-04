Strive.service('StriveHelper', function(){
	var self = this;

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
	
	self.newCalcStreak = function(ticks){

		var today,
			tick,
			tickDate,
			refDate,
			streak;

		if(!ticks || ticks.length == 0) return 0;

		streak = 0;
		refDate = self._getRefDate(new Date().toString('yyyy-MM-dd HH:mm:ss'));
		
		for(var i = 0; i < ticks.length; i++){
			tick = ticks[i];
			tickDate = new Date(tick.createdAt);
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
		
		return streak;
	}

	self.newCalcStreakRecord = function(ticks){

		var streak, 
			recordStreak = 0,
			latestTick,
			refDate,
			tick,
			d;

		if(!ticks || ticks.length == 0) return 0;
		if(ticks.length == 1) return 1;
		
		streak = 1;
		latestTick = ticks[0];
		refDate = self._getRefDate(latestTick.createdAt);
		
		for(var i = 1; i < ticks.length; i++){
			tick = ticks[i];
			d = new Date(tick.createdAt);
			
			// if the next tick is before the ref date
			// it's a streak
			if(d.isAfter(refDate)){
				streak++;	
			}else{
				streak = 1;
			}

			if(streak > recordStreak)
				recordStreak = streak;
			// get the next ticks refDate
			refDate = self._getRefDate(tick.createdAt);
		}	
		
		return recordStreak;
	}
	
	/** 
	 * A reference day is the latest time which a next comming
	 * tick has to be created for it to be counted as a streak.
	 */
	self._getRefDate = function(created){
		var d = new Date(created);
		
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

});
