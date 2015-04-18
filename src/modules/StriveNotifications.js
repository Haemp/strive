(function(){

    angular.module('Strive')

    .service('StriveNotifications', function(HabitModel, CalcHelper){
        var self = this;

        self.refreshOverview = function(){
            
            if( typeof chrome == 'undefined' || !chrome.notifications ) return;
               
            var habitsList = [];
            angular.forEach(HabitModel.habits, function(habit){

                if(!habit.isArchived && !CalcHelper.tickedToday(habit)){
                    habitsList.push({ title: habit.name, message: habit.description || 'No description' });
                }
            });

            if(habitsList.length == 0){

                chrome.notifications.create('striveOverview', {
                    type: 'list',
                    title: 'Complete!',
                    message: 'Booyah - you made all your habits today!',
                    iconUrl: 'img/strive-128.png',
                }, function(){
                    console.log('Notifications updated!');
                });

            }else{

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


        }
    })

})();