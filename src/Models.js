Strive.service('HabitModel', function(JsonStorage, $q, StriveHelper, Sync, API_DOMAIN, Utils) {
	var self = this;

	self.habits = [];
	self.newHabit = {};

	self.loadHabits = function() {

		// load habits
		var def = $q.defer();
		JsonStorage.get('habits')
			.then(function(habits) {
				self.habits = habits || [];
				def.resolve();
			}, function(error) {
				console.log('There was an error getting the habits', error);
				def.reject();
			});

		return def.promise;
	}

	self.merge = function(habits) {
		if (!habits) return 0;
		var changes = 0;
		for (var i = habits.length - 1; i >= 0; i--) {
			var newHabit = habits[i];
			var habit = self.getHabit(newHabit.id);

			if (habit) {
				if (!self.isEqual(newHabit, habit)) {

					// this is a changed habit
					// we need to make it override
					// it's older version
					habit.name = newHabit.name;
					habit.description = newHabit.description;
					habit.ticks = newHabit.ticks;
					habit.isArchived = newHabit.isArchived;
					habit.streak = StriveHelper.calculateStreak(habit.ticks);
					changes++;
				}
			} else {
				// this habit does not exist in the habit array
				// so we add it.
				self.habits.push(newHabit);
				newHabit.streak = StriveHelper.calculateStreak(newHabit.ticks);
				changes++;
			}
		};

		// loop through local habits and match 
		// them up against the new batch - if
		// they are not in the new batch remove them
		// This is the way we handle sync deletes
		for (var i = self.habits.length - 1; i >= 0; i--) {
			var habit = self.getHabitFrom(self.habits[i].id, habits);
			if( !habit ){
				self.remove(self.habits[i]);
			}
		};
		if (changes > 0) {
			self.save();
		}
		return changes;
	}

	self.edit = function(habit){
		var editedHabit = angular.copy(habit);
		Sync.batch({ 
	   	  	url:API_DOMAIN+'/api/habit', 
	   	  	method: 'PUT', 
	   	  	data: editedHabit,
	   	  	withCredentials:true
	   	});
	}

	self.isEqual = function(habit1, habit2) {
		if (
			habit1.name == habit2.name &&
			habit1.id == habit2.id &&
			habit1.isArchived == habit2.isArchived &&
			Utils.arrayEquals(habit1.ticks, habit2.ticks) &&
			Utils.stringEquals(habit1.description, habit2.description)
		) {
			return true;
		} else {
			return false;
		}
	}

	self.create = function(newHabit) {

		newHabit.createdAt = newHabit.id = Date.now();

		if (!self.habits) self.habits = [];
		self.habits.push(angular.copy(newHabit));

		Sync.batch({
			url: API_DOMAIN + '/api/habit',
			method: 'POST',
			withCredentials: true,
			data: newHabit
		});

		self.save();
	}

	self.remove = function(habit) {
		for (var i = self.habits.length - 1; i >= 0; i--) {
			if (self.habits[i].id == habit.id)
				self.habits.splice(i, 1);
		}

		Sync.batch({
			url: API_DOMAIN + '/api/habit',
			method: 'DELETE',
			params: {
				"id": habit.id
			},
			withCredentials: true
		});

		self.save();
	}

	self.getHabit = function(id) {
		
		if( !self.habits ) return;
		for (var i = self.habits.length - 1; i >= 0; i--) {
			if (self.habits[i].id == id)
				return self.habits[i];
		}
	}

	self.getHabitFrom = function(id, habits) {
		
		if( !habits ) return;
		for (var i = habits.length - 1; i >= 0; i--) {
			if (habits[i].id == id)
				return habits[i];
		}
	}

	self.tick = function(habitId) {
		var habit = self.getHabit(habitId);

		if (!habit.ticks)
			habit.ticks = [];

		habit.ticks.unshift({
			createdAt: Date.now(),
		});

		// calculate the streak
		habit.streak = StriveHelper.calculateStreak(habit.ticks);

		Sync.batch({ 
	   	  	url:API_DOMAIN+'/api/habit/tick', 
	   	  	method: 'POST', 
	   	  	data: {
	   	  		"habitId": habit.id,
		   	  	"id": Date.now(),
		   	  	"createdAt": Date.now()
	   	  	},
	   	  	withCredentials:true
	   	});

		self.save();
	}

	self.recalculateAllStreaks = function() {

		// check if we've already calculated for today
		if (self.lastCalculation && self.lastCalculation.today()) return;

		if (!self.habits || self.habits.length == 0) return;

		for (var i = 0; i < self.habits.length; i++) {
			var habit = self.habits[i];
			if (!habit.ticks) continue;

			habit.streak = StriveHelper.calculateStreak(habit.ticks);
		}

		self.lastCalculation = new Date();
		self.save();
	}

	self.save = function() {

		// clean the data
		var cleanHabitData = angular.copy(self.habits);
		for (var i = 0; i < cleanHabitData.length; i++) {
			delete cleanHabitData[i].selected;
		}

		JsonStorage.save('habits', cleanHabitData).
		then(function() {
			console.log('Habits saved!')
		}, function(error) {
			console.log('There was an error saving the habits', error);
		});
	}
});

Strive.service('StateModel', function() {
	var self = this;
	self.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
	self.userAgent = navigator.userAgent;
	self.isAndroidBrowser = ((navigator.userAgent.indexOf('Mozilla/5.0') > -1 && navigator.userAgent.indexOf('Android ') > -1 && navigator.userAgent.indexOf('AppleWebKit') > -1) && !(navigator.userAgent.indexOf('Chrome') > -1));

	self.states = [];
	console.log('Is it chrome: ', self.isChrome);
});

Strive.service('Utils', function() {
	var self = this;

	self.stringEquals = function(string1, string2) {
		if (string1 == string2) {
			return true;
		} else if (!string1 && !string2) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Check if two arrays are equal (shallow).
	 * undefined is to be equal to empty array.
	 */
	self.arrayEquals = function(a1, a2) {
		if (a1 && a2) {
			if (a1.length == a2.length) {
				return true;
			} else {
				return false;
			}

			// one of the arrays is undefined
		} else if ((!a1 || a1.length == 0) && (!a2 || a2.length == 0)) {
			return true;
		}
		return false;
	}
})

Strive.service('MonitorModel', function(JsonStorage, $q, Utils, Sync, API_DOMAIN) {
	var self = this;
	self.monitors;

	self._init = function() {

	}


	self.merge = function(monitors) {
		if (!monitors) return 0;
		var changes = 0;
		for (var i = monitors.length - 1; i >= 0; i--) {
			var newMonitor = monitors[i];
			var monitor = self.getMonitor(newMonitor.id);

			if (monitor) {
				if (!self.isEqual(newMonitor, monitor)) {

					// this is a changed habit
					// we need to make it override
					// it's older version
					monitor.name = newMonitor.name;
					monitor.description = newMonitor.description;
					monitor.dataPoints = newMonitor.dataPoints;
					habit.isArchived = newHabit.isArchived;
					changes++;
				}
			} else {
				// this habit does not exist in the habit array
				// so we add it.
				if (!self.monitors) {
					self.monitors = [];
				}
				self.monitors.push(newMonitor);
				changes++;
			}
		}

		if (changes > 0) {
			self.save();
		}
		return changes;
	}

	self.loadMonitors = function() {
		var def = $q.defer();
		JsonStorage.get('monitors')
			.then(function(monitors) {
				self.monitors = monitors || [];
				def.resolve();
			}, function(error) {
				console.log('There was an error getting the monitors', error);
				def.reject();
			});

		return def.promise;
	}

	// TODO: Refactor - has to be a better solution for this.
	self.isEqual = function(monitor1, monitor2) {
		if (
			monitor1.name == monitor2.name &&
			monitor1.id == monitor2.id &&
			monitor1.isArchived == monitor2.isArchived &&
			Utils.arrayEquals(monitor1.dataPoints, monitor2.dataPoints) &&
			Utils.stringEquals(monitor1.description, monitor2.description)
		) {
			return true;
		} else {
			return false;
		}
	}

	self.save = function() {

		// clean the data
		var cleanMonitorData = angular.copy(self.monitors);
		for (var i = 0; i < cleanMonitorData.length; i++) {
			delete cleanMonitorData[i].selected;
		}

		JsonStorage.save('monitors', cleanMonitorData)
			.then(function() {
				console.log('Monitors saved!')
			}, function(error) {
				console.log('There was an error saving the habits', error);
			});
	}

	self.create = function(newMonitor) {

		newMonitor.createdAt = newMonitor.id = Date.now();

		if (!self.monitors) self.monitors = [];
		self.monitors.push(angular.copy(newMonitor));

		Sync.batch({
			url: API_DOMAIN + '/api/monitor',
			method: 'POST',
			withCredentials: true,
			data: newMonitor
		});

		self.save();
	}

	self.edit = function(monitor){
		var editedMonitor = angular.copy(monitor);
		Sync.batch({ 
	   	  	url:API_DOMAIN+'/api/monitor', 
	   	  	method: 'PUT', 
	   	  	data: editedMonitor,
	   	  	withCredentials:true
	   	});
	}

	self.remove = function(monitor) {
		for (var i = self.monitors.length - 1; i >= 0; i--) {
			if (self.monitors[i].id == monitor.id)
				self.monitors.splice(i, 1);
		}

		Sync.batch({
			url: API_DOMAIN + '/api/monitor',
			method: 'DELETE',
			params: {
				"id": monitor.id
			},
			withCredentials: true
		});

		self.save();
	}

	self.hasDataPointToday = function(monitorId) {
		var monitor = self.getMonitor(monitorId);

		if (typeof monitor.dataPoints == 'undefined' ||
			monitor.dataPoints.length < 1) return false;

		return new Date(monitor.dataPoints[0].createdAt).isToday();
	}

	self.getMonitor = function(id) {
		if (!self.monitors) return undefined;
		for (var i = self.monitors.length - 1; i >= 0; i--) {
			if (self.monitors[i].id == id)
				return self.monitors[i];
		}
	}

	self.addDataPoint = function(monitorId, dataPointValue) {
		console.log('Creating data point', monitorId, dataPointValue);
		var monitor = self.getMonitor(monitorId);

		if (!monitor.dataPoints)
			monitor.dataPoints = [];
		
		var dataPoint = {
			createdAt: Date.now(),
			value: dataPointValue
		};
		monitor.dataPoints.unshift(dataPoint);

		Sync.batch({
			url: API_DOMAIN + '/api/monitor/data-point',
			method: 'POST',
			data: {
				monitorId: monitor.id,
				value: dataPoint.value,
				createdAt: dataPoint.createdAt
			},
			withCredentials: true
		});

		self.save();
	}

	self._init();
});