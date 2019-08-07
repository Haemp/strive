/**
 * Creates a user
 * @param String username
 * @param String password
 * @return int the user Id
 */
// app.get('/signup', function(req, res) {
//    console.log(req.query);
//    var userId,
//       createdAt,
//       user;
//
//    user = {
//       username: req.query.username,
//       googleToken: req.query.googleToken,
//       password: hasher.generate(req.query.password),
//       createdAt: Date.now()
//    };
//
//    db.collection('users').insert(user, function(err, records) {
//       if (err) throw err;
//       userId = records[0]._id;
//       res.send({
//          userId: userId,
//          status: 'User created'
//       });
//    });
// });
var hasher = require('password-hash');
var mongoose = require('mongoose');
var q = require('q');
var User = mongoose.model('User');
var Habit = mongoose.model('Habit');
var Monitor = mongoose.model('Monitor');
var model = require('../models/usync');

exports.signup = function(req, res) {

	console.log('User singup', req.query);

	var user = {
		username: req.query.email,
		password: hasher.generate(req.query.password)
	};

	// create new user
	var user = new User(user);
	user.save(function(err) {
		if (err) {
			res.send(500, {
				description: 'Could not create user',
				error: err
			});
			return;
		}

		res.send(user);
	});
}

exports.logout = function(req, res) {
	req.logout();
	res.send(200, 'You are now logged out');
}


exports.downSync = function(req, res) {

	if (!req.isAuthenticated()) {
		res.send(403, 'You have no power here. Gandalf the gray!');
		return;
	}

	// get habits
	Habit.find({
		createdBy: req.user._id
	}).sort({createdAt: 1}).exec(function(err, habits) {

		// get monitors
		Monitor.find({
			createdBy: req.user._id
		}).sort({createdAt: 1}).exec(function(err, monitor) {

			res.send(200, {
				habits: habits,
				monitors: monitor
			});
		});
	});
}
/**
 * Send all of the app data and
 * parse it into mongoose models
 */
exports.import = function(req, res) {
	console.log('Is user logged in?');
	var error, habitData, monitorData;
	var callPromises = [];
	console.log(typeof req.body.habitData);
	habitData = req.body.habitData || [];
	monitorData = req.body.monitorData || [];

	if (habitData) {
		console.log('Adding habit...', habitData.length);
		for (var i = 0; i < habitData.length; i++) {
			console.log('Adding habit', habitData[i]);
			var habit = {
				id: habitData[i].id,
				name: habitData[i].name,
				description: habitData[i].description,
				isArchived: habitData[i].isArchived,
				ticks: habitData[i].ticks,
				createdAt: habitData[i].createdAt,
				createdBy: req.user._id
			};

			// record
			callPromises.push(model.addExistingHabit(habit, req, req.user));
		}
	}

	if (monitorData) {

		console.log('Adding monitors...', monitorData.length);
		for (var i = 0; i < monitorData.length; i++) {

			var monitor = {
				id: monitorData[i].id,
				name: monitorData[i].name,
				description: monitorData[i].description,
				isArchived: monitorData[i].isArchived,
				dataPoints: monitorData[i].dataPoints,
				createdAt: monitorData[i].createdAt,
				createdBy: req.user._id
			};

			callPromises.push(model.addExistingMonitor(monitor, req, req.user));
		}
	}

	console.log('Call prmises', callPromises.length);
	q.all(callPromises).then(function() {
		res.send(200, 'All imported!');
	}, function(err) {
		res.send(500, err);
	});
}

exports.login = function(req, res) {

	var user = req.account;
	req.login(user, function(err) {
		if (err) {
			return next(err);
		}
		// clean up
		delete user['transactions'];
		res.send(200, {
			user: user,
			isNew: req.newUser
		});
	});
}

exports.sync = function(req, res){

	// auth

	// loop through incomming trans

	// apply to mapped function

}

exports.getAll = function(req, res) {
	console.log(req.session);
	if (!req.isAuthenticated()) {
		res.send(403, 'You have no power here. Gandalf the gray!');
		return;
	}

	User.find().exec(function(err, users) {
		res.send(users);
	});
}
