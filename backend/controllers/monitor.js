var hasher = require('password-hash');
var mongoose = require('mongoose');
require('date-utils');
var User = mongoose.model('User');
var Monitor = mongoose.model('Monitor');
var DataPoint = mongoose.model('DataPoint');

exports.create = function(req, res) {

	if (!req.isAuthenticated()) {
		console.log('User is not Authenticated!');
		res.send(401);
		return;
	}

	var monitorData = {
		id: req.body.id,
		name: req.body.name,
		description: req.body.description,
		dataPoints: [],
		createdAt: req.body.createdAt,
		createdBy: req.user._id
	}

	var monitor = new Monitor(monitorData);
	monitor.save(function(err) {

		if (err) {
			res.send(500, err);
			return;
		}

		res.send(200, {
			statusDescription: 'Monitor created'
		});
	});
}

exports.get = function(req, res) {

	if (!req.isAuthenticated()) {
		console.log('User is not Authenticated!');
		res.send(401);
		return;
	}

	var params = {};
	params.createdBy = req.user._id;
	if (req.query.id) {
		params.id = req.query.id;
	}

	Monitor.find(params, function(err, monitors) {

		res.send(monitors);
	});
}

exports.addDataPoint = function(req, res) {

	if (!req.isAuthenticated()) {
		console.log('User is not Authenticated!');
		res.send(401);
		return;
	}

	console.log('Adding data point', req.body.monitorId);
	Monitor.findOne({
		id: req.body.monitorId
	}, function(err, monitor) {
		console.log('monitor: ', monitor);

		if (err) res.send(500, {
			error: err
		});
		if (!monitor) {
			res.send(500, 'Could not find monitor');
			return;
		}

		if (err) {
			console.log(err);
			res.send(500, err);
			return;
		}

		var dataPoint = {
			id: req.body.id,
			log: req.body.log,
			value: req.body.value,
			createdAt: req.body.createdAt
		}
		monitor.dataPoints.push(dataPoint);

		monitor.save(function(err) {
			if (err) {
				res.send(500, err);
				return;
			}
			res.send(200, {
				statusDescription: 'monitor ticked'
			});
		});

	});
}

exports.remove = function(req, res) {

	if (!req.isAuthenticated()) {
		console.log('User is not Authenticated!');
		res.send(401);
		return;
	}

	Monitor.findOne({
		id: req.query.id
	}, function(err, monitor) {

		if (!monitor) {
			res.send(202, 'Monitor not found');
			return;
		}

		monitor.remove();
		res.send(200, {
			statusDescription: 'Monitor removed'
		});
	});
}

exports.update = function(req, res) {

	if (!req.isAuthenticated()) {
		console.log('User is not Authenticated!');
		res.send(401);
		return;
	}

	Monitor.findOne({
		id: req.body.id
	}, function(err, monitor) {

		if (err) {
			res.send(500, err);
			return;
		}

		monitor.name = req.body.name;
		monitor.description = req.body.description;

		monitor.save(function(err) {
			if (err) {
				res.send(500, err);
				return;
			}
			res.send(200, {
				statusDescription: 'monitor updated'
			});
		});
	});
}