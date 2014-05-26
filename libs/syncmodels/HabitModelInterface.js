
/**
 * This is the interface we will use on both back end
 * front end to make sure data processing is identical.
 * @param  {[type]} angular [description]
 * @param  {[type]} exports [description]
 * @return {[type]}         [description]
 */
var exports, angular;
;(function(angular, exports){
	var interface = {

		removeHabit: {
			validation: function(data){
				return !!(data.id);
			}
		},
		updateHabit: {
			validation: function(data){
				return !!(data.id);
			}	
		},
		tickHabit: {
			validation: function(data){
				return !!(data.habitId) && !!(data.tick.createdAt);
			}		
		},
		createHabit: {
			validation: function(data){
				return !!(data.id);
			}			
		}
	};

	if(exports){
		exports.HabitModelInterface = interface;
	}

	if(angular){
		angular.module('ng').constant('HabitModelInterface', interface);
	}

})(angular, exports);