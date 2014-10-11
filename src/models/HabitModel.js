
Strive.service('HabitModel', function(
	JsonStorage,
	$q,
	StriveHelper,
	API_DOMAIN,
	Utils,
	TransactionModel,
	SyncModel,
	$rootScope
) {
	var self = this;

	self.habits = [];
	self.newHabit = {};
	self.selectedHabit;
	self.syncAdapter;
	self.initiated = false;

	self._init = function(){
		SyncModel.record(this, ['removeHabit', 'editHabit', 'createHabit', 'tickHabit', 'addExistingHabit']);
	}

	self.loadHabits = function() {

		// load habits
		console.log('Loading habits...');
		var def = $q.defer();
		JsonStorage.serial_get('habits')
			.then(function(habits) {
				console.log('Habits loaded...', habits);
				self.habits = habits || [];
				def.resolve();

				self.initiated = true;
			}, function(error) {
				console.log('There was an error getting the habits', error);
				def.reject();
				self.initiated = false;
			});

		return def.promise;
	}

	self.isInitiated = function(){
		var d = $q.defer();

		var f = $rootScope.$watch(function(){
			return self.initiated;
		}, function(newVal){
			if(newVal == true){
				d.resolve();

				// no need to watch this more
				f();
			}
		})

		return d.promise;
	}

	self.getArchived = function(){
		var a = []
		var habit;

		for(var i = 0; i < self.habits.length; i++){
			habit = self.habits[i];
			if(habit.isArchived){
				a.push(habit);
			}
		}

		return a;
	}

	self.toggleEditMode = function(habit){

		// if we go from editable to 
		// non editable -> we save the 
		// current state of all habits
		habit.isEditable = !habit.isEditable;	
		if( !habit.isEditable ){
			habit.selected = false;	
			var edited = angular.copy(habit);
			delete edited.ticks;
			self.editHabit(edited);
		}
	}

	self.addExistingHabit = function(habit, done){
		var h = self.getHabit(habit.id);
		if( h ){ // this habit already exists
			return done(false);
		}
		self.habits.push(habit);
		self.save();
		done(true);
	}
	self.editHabit = function(habit, done){

		// play back needs an implementation here
		var targetHabit = self.getHabit(habit.id);
		if( habit === targetHabit || targetHabit == undefined ){
			return done(true);
		}

		targetHabit.description = habit.description;
		targetHabit.name = habit.name;
		targetHabit.isArchived = habit.isArchived;
		done(true);

		self.save();
	}


	self.createHabit = function(newHabit, done) {

		// to check for playback
		if(!newHabit.createdAt && !newHabit.id){
			newHabit.id = Date.now();
			newHabit.createdAt = new Date();
		}
			

		if (!self.habits) self.habits = [];
		self.habits.push(angular.copy(newHabit));

		self.save();

		done(true);
	}

	self.removeHabit = function(habit, done) {
		var found = false;
		for (var i = self.habits.length - 1; i >= 0; i--) {
			if (self.habits[i].id == habit.id){
				self.habits.splice(i, 1);
				found = true;
			}
		}

		self.save();
		done(found);
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
	self.sort = function(){
		self.habits.sort(function(a, b){
			return b.streak - a.streak;
		});

		self.save();
	};

	self.tickHabit = function(params, done) {

		var habit = self.getHabit(params.habitId);

		// for play back
		if(!params.createdAt)
			params.createdAt = new Date().toString('yyyy-MM-dd HH:mm:ss');

		if( !habit ){
			done(false);
			return;
		}

		if (!habit.ticks)
			habit.ticks = [];

		
		if( StriveHelper.tickedToday(habit) ){

			done(false);
			return false;
		}
		
		// This is checking if the habit has been 
		// ticked on the day that this new tick has been submitted
		// otherwise resynced ticks from yesterday will pass this check
		// and will be duplicating ticks.
		if( self.isDuplicateTick(habit.ticks, params) ){
			done(false);
			return false;
		}
		
		habit.ticks.unshift(params);

		// calculate the streak
		habit.streak = StriveHelper.newCalcStreak(habit.ticks);

		self.save();

		done(true);
	}
	
	self.isDuplicateTick = function(targetTick, ticks){
		
		for(var i = 0; i < ticks.length; i++){
			// if any of the ticks for this habit is on the
			// same date, month and year as the new ticks
			// we don't want to add it since that makes it a
			// duplicate. 
			if( StriveHelper.isTicksOnSameDay(ticks[i], targetTick) ){
				return true;		
			}
		}
		
		return false;
	}

	self.recalculateAllStreaks = function() {

		// check if we've already calculated for today
		if (self.lastCalculation && self.lastCalculation.today()) return;

		if (!self.habits || self.habits.length == 0) return;

		for (var i = 0; i < self.habits.length; i++) {
			var habit = self.habits[i];
			if (!habit.ticks) continue;

			habit.streak = StriveHelper.newCalcStreak(habit.ticks);
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

		JsonStorage.serial_save('habits', cleanHabitData).
		then(function() {
			console.log('Habits saved!')
		}, function(error) {
			console.log('There was an error saving the habits', error);
		});
	}

	self.selectHabit = function( habit ){
		if( self.selectedHabit ){
			self.selectedHabit.selected = false;
			self.selectedHabit.isEditable = false;
			self.selectedHabit.confirmDelete = false;
		}
		
		if( self.selectedHabit != habit ){
			habit.selected = true;
			self.selectedHabit = habit;	
		}else{
			self.selectedHabit = undefined;
		}
	}

	self.unArchive = function( habit ){
		habit.isArchived = false;
		self.editHabit(habit);
	}

	self.archive = function( habit ){
		
		habit.isArchived = true;
		var edited = angular.copy(habit);
		delete edited.ticks;
		self.editHabit(edited);
	}

	self.clear = function(){
		self.habits.length = 0;
		self.save();
	}

	self._init();
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
