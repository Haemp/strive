chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'bounds': {
      'width': 400,
      'height': 600
    }
  });
});

// check if the periodical alarm is set
chrome.alarms.get('dailyAlarm', function( alarm ){
	if( !alarm ){
		console.log('Alarm missing, creating now...');
		chrome.alarms.create('dailyAlarm', {
			periodInMinutes: 60*24,
			when: parseFloat( new Date().set({hour: 8, minute: 0, second:0}).getTime())
		});
	}else{
		console.log('Alarm set')
	}
});

var JsonStorage = angular.bootstrap(undefined, ['fileSystem', 'AngularSugar', 'JsonStorage']).get('JsonStorage');
console.log('Json initiated', JsonStorage);


chrome.notifications.onClicked.addListener(function(){

    // restore the window
    var windows = chrome.app.window.getAll();
    if(windows && windows[0]){
        windows[0].restore();
    }else{
        chrome.app.window.create('index.html', {
            'bounds': {
                'width': 400,
                'height': 600
            }
        });
    }
})

chrome.alarms.onAlarm.addListener(function( alarm ){

	// this alarm is set to trigger every day at 08:00
	// it runs through all the habits and creates notifications
	// for each one.
	JsonStorage.get('habits')
		.then(function(habits){
			console.log(habits);
			if( !habits ) return;

			var links = {};
			// store a reference to the habit in a notifications storage
			var notificationName = 'striveOverview';
			var hList = [];
			for (var i = 0; i < habits.length; i++) {

				var habit = habits[i];
				if( habit.isArchived ) continue;

				// Create list of habit reminders
				hList.push({title: habit.name, message: habit.name});
			};

			console.log('Creating notification ', notificationName, 'From list', hList);
			chrome.notifications.create(notificationName, {
				type: 'list',
				title: 'Reminder',
				message: 'Your habits today:',
				iconUrl: 'img/strive-128.png',
				items: hList
			}, function(){
				console.log('Notification created for', habit);
			});

		}, function(e){
			console.log('Error, could not get habits',e);
		});
});
