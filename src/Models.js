Strive.service('StriveModel', function( JsonStorage, $q, StriveHelper ){
	var self = this;

	self.habits = [];
	self.newHabit = {};

	self.loadHabits = function(){

		// load habits
		var def = $q.defer();
		JsonStorage.get('habits')
			.then(function( habits ){
				self.habits = habits;
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
		habit.streak = StriveHelper.calculateStreak(habit.ticks);

		self.save();
	}



	self.recalculateAllStreaks = function(){

		// check if we've already calculated for today
		if( self.lastCalculation &&	 self.lastCalculation.today() ) return;

		if( !self.habits || self.habits.length == 0 ) return;

		for (var i = 0; i < self.habits.length; i++) {
			var habit = self.habits[i];
			if( !habit.ticks ) continue;

			habit.streak = StriveHelper.calculateStreak( habit.ticks );
		}

		self.lastCalculation = new Date();
		self.save();
	}

	self.save = function(){

		// clean the data
		var cleanHabitData = angular.copy(self.habits);
		for(var i = 0; i < cleanHabitData.length; i++){
			delete cleanHabitData[i].selected;
		}

		JsonStorage.save('habits', cleanHabitData).
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
	self.userAgent = navigator.userAgent;
	self.isAndroidBrowser = ((navigator.userAgent.indexOf('Mozilla/5.0') > -1 && navigator.userAgent.indexOf('Android ') > -1 && navigator.userAgent.indexOf('AppleWebKit') > -1) && !(navigator.userAgent.indexOf('Chrome') > -1));

	self.states = [];
	console.log('Is it chrome: ', self.isChrome);
});


Strive.service('MonitorModel', function( JsonStorage, $q ){
	var self = this;
	self.monitors;

	self._init = function(){

	}

	self.loadMonitors = function(){
		var def = $q.defer();
		JsonStorage.get('monitors')
			.then(function( monitors ){
				self.monitors = monitors;
				def.resolve();
			}, function( error ){
				console.log('There was an error getting the monitors', error);
				def.reject();
			});

		return def.promise;
	}

	self.save = function(){

		// clean the data
		var cleanMonitorData = angular.copy(self.monitors);
		for(var i = 0; i < cleanMonitorData.length; i++){
			delete cleanMonitorData[i].selected;
		}

		JsonStorage.save('monitors', cleanMonitorData)
			.then(function(){
				console.log('Monitors saved!')
			}, function( error ){
				console.log('There was an error saving the habits', error);
			});
	}

	self.create = function( newMonitor ){

		newMonitor.createdAt = newMonitor.id = Date.now();

		if( !self.monitors ) self.monitors = [];
		self.monitors.push( angular.copy(newMonitor) );

		self.save();
	}

	self.remove = function( monitor ){
		for (var i = self.monitors.length - 1; i >= 0; i--) {
			if( self.monitors[i].id == monitor.id )
				self.monitors.splice(i, 1);
		}

		self.save();
	}

	self.hasDataPointToday = function( monitorId ){
		var monitor = self.getMonitor( monitorId );

		if( typeof monitor.dataPoints == 'undefined' ||
			monitor.dataPoints.length < 1 ) return false;

		return new Date(monitor.dataPoints[0].createdAt).isToday();
	}

	self.getMonitor = function( id ){
		for (var i = self.monitors.length - 1; i >= 0; i--) {
			if( self.monitors[i].id == id )
				return self.monitors[i];
		}
	}

	self.addDataPoint = function( monitorId, dataPointValue ){
		console.log('Creating data point', monitorId, dataPointValue);
		var monitor = self.getMonitor( monitorId );

		if( !monitor.dataPoints )
			monitor.dataPoints = [];

		monitor.dataPoints.unshift({
			createdAt: Date.now(),
			value: dataPointValue
		});

		self.save();
	}

	self._init();
});
