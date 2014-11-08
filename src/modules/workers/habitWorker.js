importScripts('../../../bower_components/Datejs/build/date.js','../../StriveHelper.js');

var StriveHelper = new _StriveHelper();

addEventListener('message', function(e){

	var params = e.data;
	console.log('Worker input');
	switch(params.name){
		case 'recalc': recalc(params.habits, params.lastCalculation); break;
	}

})


function recalc(habits, lastCalculation){
	console.log('Worker calc');
	if (lastCalculation && lastCalculation.today()) return;

	if (!habits || habits.length == 0) return;

	for (var i = 0; i < habits.length; i++) {
		var habit = habits[i];
		if (!habit.ticks) continue;

		habit.tickedToday = StriveHelper.tickedToday(habit);
		habit.streak = StriveHelper.newCalcStreak(habit.ticks);
		habit.streakRecord = StriveHelper.newCalcStreakRecord(habit.ticks);
	}

	lastCalculation = new Date();

	postMessage({name: 'recalc', habits: habits, lastCalculation: lastCalculation});
}