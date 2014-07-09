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
	self.calculateStreakRecord = function( habit ){

		// get the last added tick
		var ticks = habit.ticks;
		if( ticks < 1 ) return 0;
		var recordStreak = 0;
		var lastTickDate = new Date(ticks[0].createdAt);
		var streak = 0;
		var tick;


		// loop through all the tick from the latest
		// entries to the last. We parrallelly loop
		// through the lastTickDate one day at a time
		// and see that there exists a tick for
		// each day.
		for (var i = 0; i < ticks.length; i++) {
			tick = ticks[i];

			// do we have a tick for this day
			if( new Date(tick.createdAt).getDate() == lastTickDate.getDate() ){
				streak++;

				// decrement the lastTickDate
				lastTickDate.add(-1).days();

			// there is no tick for this day
			// aka we broke the streak - now we
			// record how high the streak was
			// and continue on.
			}else{

				console.log('Streak end', streak);
				if( streak > recordStreak ){
					recordStreak = streak;
				}
				streak = 1;

				// set the new lastTickDate to
				// the current ticks date - this
				// is where it starts again.

				lastTickDate = new Date(ticks[i+1].createdAt);
				console.log('New streak starts', lastTickDate);
			}

		}

		if( streak > recordStreak ){
			recordStreak = streak;
		}

		// return the highest number
		return recordStreak;
	}

	self.calculateStreak = function( ticks ){
		if(!ticks || ticks.length == 0) return 0;
		// is the lastest tick from today or yesterday
		// then start counting streaks
		var latestTick = ticks[0];
		var latestTickTime = new Date(latestTick.createdAt);
		var today = new Date();
		var yesterday = new Date().add(-1).days();
		yesterday.set({hour:0, minute:0, second:0, millisecond:0});

		if( !latestTickTime.isAfter(yesterday) )
			return 0;

		// how many days in a row have this habit
		// been ticked
		var lastTick = new Date(ticks[0].createdAt);
		var streak = 1;
		for (var i = 1; i < ticks.length; i++) {
			var tick = ticks[i];
			if( new Date(tick.createdAt).getDate() == lastTick.add(-1).days().getDate() )
				streak++;
			else
				break;
		}

		return streak;
	}

});
