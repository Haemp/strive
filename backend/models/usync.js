/**

  All functions here are ones tracked by the SyncModel
  No need to track getters.

*/

var hasher = require('password-hash');
var mongoose = require('mongoose');
require('date-utils');
var User = mongoose.model('User');
var Recipe = mongoose.model('Recipe');
var q = require('q');
var Monitor = mongoose.model('Monitor');
var Habit = mongoose.model('Habit');
var StriveHelper = require('../lib/StriveHelper');

exports.createMonitor = function(data, done, req) {

	var monitorData = {
		id: data.id,
		name: data.name,
		description: data.description,
		dataPoints: [],
		createdAt: data.createdAt,
		createdBy: req.user._id
	}

	var monitor = new Monitor(monitorData);
	monitor.save(function(err) {

		if (err) {
			return done(false);
		}

		done(true);
	});
}

exports.addDataPoint = function(data, done) {

	Monitor.findOne({
		id: data.monitorId
	}, function(err, monitor) {

		if (err || !monitor) return done(false);

		var dataPoint = {
			log: data.log,
			value: data.value,
			createdAt: data.createdAt
		}

		monitor.dataPoints.unshift(dataPoint);

		monitor.save(function(err) {
			if (err) {
				return done(false);
			}
			done(true);
		});
	});
}

exports.removeMonitor = function(data, done) {

	Monitor.findOne({
		id: data.id
	}, function(err, monitor) {

		if (!monitor || err) {
			return done(false);
		}

		monitor.remove(function(err) {
			if (err) return done(false);

			done(true);
		});
	});
}

exports.addExistingMonitor = function(data, done){
	console.log(Date(), 'Creating existing monitor');
	var d = q.defer();

	var monitor = new Monitor(data);
	monitor.save(function(err){
		if(err){
			console.log(err);
			d.reject();
			return done(false);
		}

		d.resolve();
		return done(true);
	});

	return d.promise
}

exports.editMonitor = function(data, done) {
	console.log(Date(), 'Editing monitor');
	Monitor.findOne({
		id: data.id
	}, function(err, monitor) {

		if (err) {
			console.log(Date(), 'Editing monitor failed', err);
			done(false);
			return;
		}

		monitor.name = data.name;
		monitor.description = data.description;

		monitor.save(function(err) {
			if (err) {
				console.log(Date(), 'Editing monitor failed', err);
				done(false);
				return;
			}
			done(true);
		});
	});
}

exports.createHabit = function(data, done, req) {
	console.log(Date(), 'Creating habit', data);
	var habitData = {
		id: data.id,
		name: data.name,
		description: data.description,
		ticks: [],
		createdAt: data.createdAt,
		createdBy: req.user._id
	}

	var habit = new Habit(habitData);
	habit.save(function(err) {
		if (err) {

			console.log(Date(), 'Error creating habit');
			return done(false);
		}

		console.log(Date(), 'Habit created');
		done(true);
	});
}

/**
 * Adds a habit with ticks already in it
 */
exports.addExistingHabit = function(data, done){
	console.log('Creating existing habit', data);
	var d = q.defer();

	var habit = new Habit(data);
	habit.save(function(err){
		if(err){
			console.log(err);
			d.reject();
			return done(false);
		}

		d.resolve();
		return done(true);
	});

	return d.promise
}

/**
 * Accepted: If already ticked today
 */
exports.tickHabit = function(data, done, req) {
	console.log(Date(), 'Ticking habit...', data.habitId, data.createdAt);
	Habit.findOne({
		id: data.habitId
	}, function(err, habit) {
		
		if (!habit || err) {
			console.log('Habit wassnt found');
			return done(false);
		}

		if (req.user._id != habit.createdBy) {
			
			console.log('User did not own that habit');
			return done(false)
		}

		// To make sure we don't allow a tick that falls within
		// the same Strive day as another one we need to analyse
		// the ticks
		
		// loop through and check if the to be added tick
		// is on the same day as one tick
		for (var i = habit.ticks.length - 1; i >= 0; i--) {
			var oldTick = habit.ticks[i];

			// TODO: Bug: this gives false positive when Syncing after 00 habits
			if(StriveHelper.isTicksOnSameDay(data, oldTick)){
				console.log('This habit was ticked today', data, oldTick);
				return done(false);
			}
		};
		
		// no previous ticks - go ahead and
		// tick
		console.log('Pushing tick');
		habit.ticks.unshift({
			id: data.id,
			createdAt: data.createdAt
		});
		
		console.log('Saving...');
		habit.save(function(err) {
			if (err) {
				console.log('Error on save');
				console.log(err);
				return done(false);
			}
			console.log('Saved!');
			done(true);
		});
	});
}

/**
 * Accepted: Removing a habit that does not exist
 */
exports.removeHabit = function(data, done) {
	console.log('Removing habit', data);
	Habit.findOne({
		id: data.id
	}, function(err, habit) {

		if (err) {
			console.log(err);
			done(false);
			return;
		}
		if(!habit){
			console.log('Habit not found');
			return done(false);
		}

		habit.remove(function(err) {
			if (err) {
				console.log(err);
				done(false);
				return;
			}
			done(true);
		});
	});
}

exports.editHabit = function(data, done) {

	Habit.findOne({
		id: data.id
	}, function(err, habit) {
		if (!habit || err) {
			return done(false);
		}
		habit.name = data.name;
		habit.description = data.description;
		habit.isArchived = data.isArchived;

		habit.save(function(err){
			if(err) return done(false);

			done(true);
		});
	});
}
