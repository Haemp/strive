Strive.service('StriveModel', function( JsonStorage, $q ){
	var self = this;

	self.habits = [];
	self.newHabit = {};

	self.loadHabits = function(){
		
		// load habits
		var def = $q.defer();
		JsonStorage.get('habits')
			.then(function( habits ){
				self.habits = habits;
			
				console.log('baits!');

				def.resolve();
			}, function( error ){
				console.log('There was an error getting the habits', error);
				def.reject();
			});

		return def.promise;
	}

	self.create = function( newHabit ){

		newHabit.createdAt = newHabit.id = Date.now();

		if( !self.habits ) self.habits = [];
		self.habits.push( angular.copy(newHabit) );

		self.save();
	}

	self.remove = function( habit ){
		for (var i = self.habits.length - 1; i >= 0; i--) {
			if( self.habits[i].id == habit.id )
				self.habits.splice(i, 1);
		}

		self.save();
	}

	self.updateHabit = function( updatedHabit ){
		var oldHabit = self.getHabit(habit.id);
		oldHabit.name = updatedHabit.name;

		self.save();
	}

	self.getHabit = function( id ){
		for (var i = self.habits.length - 1; i >= 0; i--) {
			if( self.habits[i].id == id )
				return self.habits[i];
		}
	}

	self.tick = function( habitId ){
		var habit = self.getHabit( habitId );

		if( !habit.ticks )
			habit.ticks = [];

		habit.ticks.unshift({ 
			createdAt: Date.now(),
		});

		// calculate the streak
		habit.streak = self.calculateStreak(habit.ticks);

		self.save();
	}
	self.calculateStreak = function( ticks ){

		// is the lastest tick from today or yesterday 
		// then start counting streaks
		var firstTick = ticks[0];
		var firstTickTime = new Date(firstTick.createdAt);
		var today = new Date();
		var yesterday = new Date().add(-1).days();
		yesterday.set({hour:0, minute:0, second:0, millisecond:0});

		if( !firstTickTime.isAfter(yesterday) )
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

	self.recalculateAllStreaks = function(){

		// check if we've already calculated for today
		if( self.lastCalculation &&	 self.lastCalculation.today() ) return;

		if( !self.habits || self.habits.length == 0 ) return; 
		
		for (var i = 0; i < self.habits.length; i++) {
			var habit = self.habits[i];
			if( !habit.ticks ) continue;

			habit.streak = self.calculateStreak( habit.ticks );
		}

		self.lastCalculation = new Date();
		self.save();
	}

	self.save = function(){
		JsonStorage.save('habits', self.habits).
			then(function(){ 
				console.log('Habits saved!') 
			}, function( error ){
				console.log('There was an error saving the habits', error);
			});
	}
});

Strive.service('StateModel', function(){
	var self = this;
	self.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

	console.log('Is it chrome: ', self.isChrome);
});

Strive.service('StriveHelper', function(){
	var self = this;

	self.getStreakIcon = function( streak ){
		
		if( streak >= 125 ){
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
});