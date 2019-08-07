var users = require('../controllers/user');
var habit = require('../controllers/habit');
var recipeCtrl = require('../controllers/recipe');
var monitor = require('../controllers/monitor');
var recipeCtrl = require('../controllers/recipe');
var SyncModel = require('../lib/SyncModel');
var model = require('../models/usync');
var passport = require('passport');

var mongoose = require('mongoose');
var Monitor = mongoose.model('Monitor');
var Habit = mongoose.model('Habit');
var Recipe = mongoose.model('Recipe');

module.exports = function(app) {


	var express = require('express');

	app.use('/', express.static(__dirname + '/../amplex'));

	/**
	 * CORS Enabled
	 */
	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Credentials', true);
		res.header('Access-Control-Allow-Origin', req.headers.origin);
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

		if ('OPTIONS' == req.method) {
			res.send(200);
		} else {
			next();
		}
	});

	SyncModel.resyncCallback = function(params){
		console.log('In ResyncCallback');
		var req = params.req,
			res = params.res,
			habits,
			monitors,
			recipes,
			syncVersion = params.syncVersion;

		// get all habits
		var habitParams = {};
		habitParams.createdBy = req.user._id;
		console.log('Looking for habits from', req.user._id);

		Recipe.find({createdBy: req.user._id}, function(err, recipes){
			console.log('Recipes fetched');
			
			Habit.find(habitParams, function(err, habits){
				console.log('Habits found', habits);

				Monitor.find({createdBy:req.user._id}, function(err, monitors) {
					console.log('Monitors found', habits);
					console.log('Sending resyncdata');
					res.send({
						resyncData: {
							habits: habits,
							monitors: monitors,
							recipes: recipes
						},
						syncVersion: params.syncVersion
					});
				});
			});	
		})
	}

	SyncModel.pair(model, [
		'createHabit',
		'editHabit',
		'removeHabit',
		'tickHabit',
		'createMonitor',
		'editMonitor',
		'removeMonitor',
		'addDataPoint',
		'addExistingHabit',
		'addExistingMonitor'
	]);
	SyncModel.registerPlayback('createRecipe', recipeCtrl.createRecipe);
	SyncModel.registerPlayback('removeRecipe', recipeCtrl.removeRecipe);
	SyncModel.registerPlayback('updateRecipe', recipeCtrl.updateRecipe);


	app.get('/signup', users.signup);
	app.post('/api/commands', SyncModel.command);

	/*************************************
	 * Recipes API
	 ************************************/
	 app.post('/api/recipe/fork', recipeCtrl.copyRecipe);
	 app.get('/api/recipe/published', recipeCtrl.getPublishedRecipes);

	/*************************************
	 * Habits API
	 ************************************/
	app.post('/api/habit', habit.create);
	app.post('/api/habit/tick', habit.tick);
	app.get('/api/habit', habit.get);
	app.put('/api/habit', habit.update);
	app.delete('/api/habit', habit.remove);

	/*************************************
	 * Monitors API
	 ************************************/
	app.post('/api/monitor', monitor.create);
	app.post('/api/monitor/data-point', monitor.addDataPoint);
	app.get('/api/monitor', monitor.get);
	app.put('/api/monitor', monitor.update);
	app.delete('/api/monitor', monitor.remove);

	/*************************************
	 * User API
	 ************************************/
	app.post('/api/user/import', users.import);
	app.get('/api/user/down-sync', users.downSync);

	app.get('/login', function(req, res) {
		res.sendfile('./public/login.html');
	});
	app.post('/api/login',
		passport.authorize('local'),
		users.login
	);

	app.get('/api/logout', users.logout);
	app.get('/users',
		users.getAll
	);

};
