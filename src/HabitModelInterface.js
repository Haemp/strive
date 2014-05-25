
/**
 * This is the interface we will use on both back end
 * front end to make sure data processing is identical.
 * @param  {[type]} angular [description]
 * @param  {[type]} exports [description]
 * @return {[type]}         [description]
 */
;(function(angular, exports){
	var interface = {

		removeHabit: {
			validation: function(data){
				return !!(data.habitId);
			}
		}
		updateHabit: {
			validation: function(data){
				return !!(data.id);
			}	
		}
		tickHabit: {
			validation: function(data){
				return !!(data.habitId) && !!(data.tick.createdAt);
			}		
		}
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


/**
 * This is describing the instantiation of the interface
 * @type {Array}
 */
var methods = [
	{ name: 'removeHabit', func: function(data){
		self.habits.push(data);

		return true;
	}},
]

var transactions = {
	add: function(transaction){
		UserModel.transactions.push(transaction);
		UserModel.version = UserModel.transactions.length;
	},
	getVersion: function(){
		return JSON.parse(localStorage.transactions).length;
	}
}

/**
 * Creates adapters from interfaces
 * @param  {[type]} interface [description]
 * @param  {[type]} callbacks [description]
 * @return {[type]}           [description]
 */
function createAdapter(interface, methods, transactions){
	var adapter, method;
	adapter = {
		transactions: [];
	};

	for (var i = methods.length - 1; i >= 0; i--) {
		method = methods[i];
		adapter[method.name] = function(data){
			
			// if the method is successfull
			// we record the transaction.
			if( method.func(data) ){
				transactions.add({name: method.name, data:data, time:Date.now()});
			}
		}
	}
	return {
	}
}

adapter = createAdapter(interface);

HabitModel{
	
	self.habits = []

	self.removeHabit = function(habitId){
		adapter.removeHabit({habitId:habitId})

		self.save();
	}
}
adapter.