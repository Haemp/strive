(function() {

	angular.module('Strive')

	.service('MonitorModel', function(JsonStorage, $q, Utils, API_DOMAIN, SyncModel) {
		var self = this;
		self.monitors;
		self.initiated = false;
		self.selectedMonitor;

		self._init = function() {
			SyncModel.record(this, ['removeMonitor', 'editMonitor', 'createMonitor', 'addDataPoint', 'addExistingMonitor']);
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

		self.addExistingMonitor = function(monitor, done) {
			var m = self.getMonitor(monitor.id);
			if (m) {
				// monitor already exists
				return done(false);
			}
			self.monitors.push(monitor);
			self.save();
			done(true);
		}

		self.loadMonitors = function() {
			console.log('Loading monitors...');
			var def = $q.defer();
			JsonStorage.serial_get('monitors')
				.then(function(monitors) {
					console.log('Monitors loaded...', monitors);
					self.monitors = monitors || [];
					def.resolve();
					self.initiated = true;

				}, function(error) {
					console.log('There was an error getting the monitors', error);
					def.reject();

					self.initiated = false;
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

		self.sort = function() {

			if (self.monitors && self.monitors.length > 1) {
				self.monitors.sort(function(a, b) {
					if (!b.dataPoints || !a.dataPoints) return -999;
					return b.dataPoints.length - a.dataPoints.length;
				});
			} else {
				return;
			}

			for (var i = 0; i < self.monitors.length; i++) {
				if (self.monitors[i].dataPoints && self.monitors[i].dataPoints.length > 1) {
					self.monitors[i].dataPoints.sort(function(a, b) {
						return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
					})
				}
			}

			self.save();
		}

		self.save = function() {

			// clean the data
			var cleanMonitorData = angular.copy(self.monitors);
			for (var i = 0; i < cleanMonitorData.length; i++) {
				delete cleanMonitorData[i].selected;
			}

			JsonStorage.serial_save('monitors', cleanMonitorData)
				.then(function() {
					console.log('Monitors saved!')
				}, function(error) {
					console.log('There was an error saving the habits', error);
				});
		}

		self.createMonitor = function(newMonitor, done) {

			if (!newMonitor.createdAt && !newMonitor.id) {
				newMonitor.createdAt = newMonitor.id = Date.now();
			}

			if (!self.monitors) self.monitors = [];
			self.monitors.push(angular.copy(newMonitor));

			self.save();

			done(true);
		}

		self.editMonitor = function(monitor, done) {
			var editedMonitor = self.getMonitor(monitor.id);

			if (editedMonitor === monitor) {
				return done(true);
			}

			editedMonitor.description = monitor.description;
			editedMonitor.name = monitor.name;
			editedMonitor.isArchived = monitor.isArchived;

			self.save()
			done(true);
		}

		self.removeMonitor = function(monitor, done) {
			var found = false;
			for (var i = self.monitors.length - 1; i >= 0; i--) {
				if (self.monitors[i].id == monitor.id) {
					self.monitors.splice(i, 1);
					found = true;
				}
			}

			self.save();
			done(found);
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

		self.addDataPoint = function(dataPoint, done) {
			console.log('Creating data point', dataPoint);
			var monitor = self.getMonitor(dataPoint.monitorId);

			if (!monitor) {
				return done(false);
			}

			if (!monitor.dataPoints)
				monitor.dataPoints = [];

			monitor.dataPoints.unshift(dataPoint);

			self.save();
			done(true);
		}

		self.clear = function() {
			self.monitors.length = 0;
			self.save();
		}

		self.toggleEditMode = function( monitor ){
		
			// if we go from editable to 
			// non editable -> we save the 
			// current state of all habits
			monitor.isEditable = !monitor.isEditable;	
			if( !monitor.isEditable ){
				monitor.selected = false;	
				var edited = angular.copy(monitor);
				delete edited.dataPoints;
				self.editMonitor(edited);
			}
		}

		self.numDataPoints = function(monitor){
			return ( typeof monitor.dataPoints != 'undefined' ) ? monitor.dataPoints.length : 0;
		}

		self.hasDataPointToday = function( monitor ){
			return MonitorModel.hasDataPointToday( monitor.id );
		}

		self.selectMonitor = function( monitor ){
			if( self.selectedMonitor ){
				delete self.selectedMonitor.selected;
				delete self.selectedMonitor.isEditable;
				delete self.selectedMonitor.confirmDelete;
			}
				
			if( self.selectedMonitor != monitor ){
				monitor.selected = true;
				self.selectedMonitor = monitor;	
			}else{
				self.selectedMonitor = undefined;
			}
		}

		self._init();
	})


	.directive('monitor', function(MonitorModel, StriveHelper){
		return{
			restrict: 'E',
			scope:{
				monitor: '=?'
			},
			templateUrl: 'src/modules/monitor/monitor.html',
			link: function(scope){
				
				scope.StriveHelper = StriveHelper;
				
				scope.selectMonitor = MonitorModel.selectMonitor;
				scope.removeMonitor = MonitorModel.removeMonitor;
				scope.toggleEditMode = MonitorModel.toggleEditMode;
				scope.numDataPoints = MonitorModel.numDataPoints;
				scope.hasDataPointToday = MonitorModel.hasDataPointToday;

				scope.addDataPoint = function( monitor, newDataValue ){

					// clear the value from the view
					delete monitor.newDataValue; 

					var dataPoint = {
						createdAt: Date.now(),
						value: parseFloat(newDataValue, 10),
						monitorId: monitor.id
					}

					MonitorModel.addDataPoint( dataPoint );
				}

				scope.showChartForMonitor = function( monitor ){
					return (typeof monitor.dataPoints != 'undefined' && monitor.dataPoints.length > 0 )
				}
			}
		}
	})

})()
