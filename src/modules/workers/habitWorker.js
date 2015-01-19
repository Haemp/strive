importScripts('../../../bower_components/Datejs/build/date.js','../../StriveHelper.js');

var StriveHelper = new _StriveHelper();

addEventListener('message', function(e){

	var params = e.data;
	console.log('Worker input');
	switch(params.name){
		case 'recalcAll': recalcAll(params.habits); break;
		case 'recalcHabit': recalcHabit(params.habit); break;
	}

})


function recalcAll(habits){

	if (!habits || habits.length == 0) return;

	console.log('AllCalcWorkflow: #6 Worker: Recalculating habits');
	for (var i = 0; i < habits.length; i++) {
		var habit = habits[i];
		if (!habit.ticks) continue;

		habit.tickedToday = StriveHelper.tickedToday(habit);
		habit.streak = StriveHelper.newCalcStreak(habit.ticks);
		habit.streakRecord = StriveHelper.newCalcStreakRecord(habit.ticks);
	}

	console.log('AllCalcWorkflow: #7 Worker: Sending habits back to main thread', habits.length + ' Habits calculated!');
	postMessage({name: 'recalcAll', habits: habits});
}

function recalcHabit(habit){
	if(!habit) return;

	console.log('HabitCalcWorkflow: #3 Worker: Habit '+ habit.name + ' is being recalculated');
	var tickedToday = StriveHelper.tickedToday(habit);
	var streak = StriveHelper.newCalcStreak(habit.ticks);
	var streakRecord = StriveHelper.newCalcStreakRecord(habit.ticks);

	console.log('HabitCalcWorkflow: #4 Worker: Posting values back to main thread');
	postMessage({
		name: 'recalcHabit',
		tickedToday: tickedToday,
		streak: streak,
		streakRecord: streakRecord
	});
}