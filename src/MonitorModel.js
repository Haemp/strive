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