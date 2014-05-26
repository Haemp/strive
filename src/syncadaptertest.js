

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
adapter = createAdapter(interface);

HabitModel{
	
	self.habits = []

	self.removeHabit = function(habitId){
		adapter.removeHabit({habitId:habitId})

		self.save();
	}
}
adapter.