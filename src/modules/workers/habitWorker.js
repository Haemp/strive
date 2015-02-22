importScripts('../../../bower_components/Datejs/build/date.js','../../modules/calc/CalcHelper.js');

var CalcHelper = new _CalcHelper();

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

    // TODO: Refactor this into CalcHelper so it can more easily be tested
	for (var i = 0; i < habits.length; i++) {
		var habit = habits[i];
		if (!habit.ticks) continue;

		habit.tickedToday = CalcHelper.tickedToday(habit);
		habit.streak = CalcHelper.newCalcStreak(habit.ticks);
		habit.streakRecord = CalcHelper.newCalcStreakRecord(habit.ticks);
	}

	console.log('AllCalcWorkflow: #7 Worker: Sending habits back to main thread', habits.length + ' Habits calculated!');
	postMessage({name: 'recalcAll', habits: habits});
}

function recalcHabit(habit){
	if(!habit) return;

    // TODO: Refactor this into CalcHelper so it can more easily be tested
	console.log('HabitCalcWorkflow: #3 Worker: Habit '+ habit.name + ' is being recalculated');
	var tickedToday = CalcHelper.tickedToday(habit);
	var streak = CalcHelper.newCalcStreak(habit.ticks);
	var streakRecord = CalcHelper.newCalcStreakRecord(habit.ticks);

	console.log('HabitCalcWorkflow: #4 Worker: Posting values back to main thread');
	postMessage({
		name: 'recalcHabit',
		tickedToday: tickedToday,
		streak: streak,
		streakRecord: streakRecord
	});
}