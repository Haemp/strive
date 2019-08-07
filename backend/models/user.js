var mongoose = require('mongoose');
var hasher = require('password-hash');
var Schema = mongoose.Schema;

console.log('Registering mongoose schema for user')

// we defined our user schema
var userSchema = new Schema({
  username: { type: String, default: '', unique: true },
  email: { type: String, default: '', unique: true },
  createdAt: { type: Date, default: Date.now },
  password: { type: String, default: '' },
  transactions: [{
  	name: String,
  	data: String,
  	time: Date
  }],
  syncVersion: { type: Number, default: 0 }
});

userSchema.methods.validPassword = function( password ){
   console.log('Current password', this.password);
   console.log('Compare against', password);
   // TODO access the current users password.
   return hasher.verify(password, this.password);
};

userSchema.methods.syncData = function( data ){
	var Habit = mongoose.model('Habit');
   var habits = data.habits;
   var monitors = data.monitors;
   var settings = data.settings;

   for (var i = 0; i < habits.length; i++){
      var habit = habits[i];

      Habit.create(habit);
   }
}
mongoose.model('User', userSchema);
