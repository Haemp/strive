angular.module('OnBoarding', ['Tip'])

.run(function(HabitModel, MonitorModel, $rootScope, TipModel){
	var init = $rootScope.$watch(function(){
		return HabitModel.initiated && MonitorModel.initiated;
	}, function(newValue){
		if(newValue === true){

			// now we are sure that the models are 
			// properly initiated we can now
			// check the status of this user
			if(HabitModel.habits.length === 0){
				console.log('User has no habits');
				TipModel.enable('habit-tip')
				TipModel.enable('archive-tip')
			}else{
				
				if(HabitModel.getArchived().length === 0){
					console.log('User has no archived habits');
					TipModel.enable('archive-tip');
				}
			}

			if(MonitorModel.monitors.length === 0){
				console.log('User has no monitors');
				TipModel.enable('monitor-tip')
			}

			// we don't need this more now
			// remove the watcher
			init();
		}
	})


	var habitsWatcher = $rootScope.$watch(function(){
		return HabitModel.habits.length;
	}, function(newValue){
		if(newValue === 1){

			if(HabitModel.habits[0].ticks && HabitModel.habits[0].ticks.length > 0){
				TipModel.enable('first-tick-tip')
				habitsWatcher();
			}else{
				TipModel.enable('first-habit-tip')
			}
		}
	})
})