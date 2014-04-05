chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'bounds': {
      'width': 400,
      'height': 600
    }
  });
});

console.log('From bg');
window.addEventListener('focus', function(){
  console.log('onfocus');
});
window.addEventListener('blur', function(){
  console.log('blur');
});
window.addEventListener('focusin', function(){
  console.log('focusin');
});
window.addEventListener('focusout', function(){
  console.log('focusout');
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

var JsonStorage = angular.bootstrap(undefined, ['fileSystem', 'JsonStorage']).get('JsonStorage');
console.log('Json initiated', JsonStorage);


chrome.alarms.onAlarm.addListener(function( alarm ){

	// this alarm is set to trigger every day at 08:00 
	// it runs through all the habits and creates notifications
	// for each one.
	JsonStorage.get('habits')
		.then(function(habits){
			console.log(habits)		
			if( !habits ) return;

			var links = {};
			for (var i = 0; i < habits.length; i++) {
				
				var habit = habits[i];
				if( habit.isArchived ) continue;
				var notificationName = Date.now()+'';
				
				// store a reference to the habit in a notifications storage
				links[notificationName] = habit;

				// now we need some way of binding the 
				chrome.notifications.create(notificationName, {
					type: 'basic',
					title: habit.name,
					message: 'Reminder',
					iconUrl: 'img/strive-128.png'
				}, function(){
					console.log('Notification created for', habit);
				});
			};
			
			JsonStorage.save('notifications', links);
		}, function(e){
			console.log('Error, could not get habits',e);
		});
});

