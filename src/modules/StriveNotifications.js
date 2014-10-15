(function(){

    angular.module('Strive')

    .service('StriveNotifications', function(HabitModel, StriveHelper){
        var self = this;

        self.refreshOverview = function(){
            
            if( !chrome.notifications ) return;
               
            var habitsList = [];
            angular.forEach(HabitModel.habits, function(habit){

                if(!habit.isArchived && !StriveHelper.tickedToday(habit)){
                    habitsList.push({ title: habit.name, message: habit.description || 'No description' });
                }
            });

            chrome.notifications.create('striveOverview', {
				type: 'list',
				title: 'Reminder',
				message: 'Your habits today:',
				iconUrl: 'img/strive-128.png',
				items: habitsList
			}, function(){
                console.log('Notifications updated!');
			});

        }
    })

})();