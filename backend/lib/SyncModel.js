var mongoose = require('mongoose');
var User = mongoose.model('User');
var model = require('../models/usync');
var Q = require('q');

// array to keep the callbacks
// for manually registered transactions
// on
var playbacks = {};

// this will trigger if we have a version 0 
module.exports.resyncCallback = function(){
	console.log('Full resync is not enabled');
}

module.exports.registerPlayback = function(transName, callback){
	playbacks[transName] = callback;
}

function executePlayback(nameTrans, data, req){
	
	var d = Q.defer();

	playbacks[nameTrans](data, req).then(function(){

		// If the registered listener is succuessful 
		// we record the transaction into the transaction
		// hisotry. This will now be synced to other devices.
		console.log('Saving transaction', nameTrans, data);
		req.user.transactions.push({
			name: nameTrans,
			data: JSON.stringify(data),
			time: data.time
		});
		req.user.syncVersion = req.user.transactions.length;
		req.user.save(function(){
			
			console.log('Saving user and resolving trans');
			d.resolve();
		})
	}, function(res){
		d.reject('This was not a valid transaction: '+res);
	})	

	return d.promise;
}

module.exports.command = function(req, res) {
	var sendTransactions;
	
	if( req.body.transactions && req.body.transactions.length > 0 ){
		console.log(new Date(), 'Incomming transactions: ', req.body.transactions);	
	}
	
	if( !req.isAuthenticated() ){
		console.log(new Date(), 'User is not logged in');
		return res.send(401, 'You have no power here, Gandalf - the gray.'); 
	}
	var user = req.user;
	// auth
	

	var version = req.body.version;
	var transactions = req.body.transactions;

	// analyse the version to see what transactions we
	// need to send back
	if( version < user.syncVersion ){

		console.log('Versions are not the same, client: ', version, ' Server: ', user.syncVersion);
		console.log('Slicing ', version, 'from ', user.transactions);
		sendTransactions = user.transactions.slice(version);
		console.log('Sync transactions: ', sendTransactions.length);
	}

	// // apply all the transactions on the database
	// var promises = [];
	// for (var i = 0; i < transactions.length; i++) {
	// 	console.log('Syncing transaction', transactions[i]);
	// 	transactions[i].data.time = transactions[i].time;
	// 	promises.push(model[transactions[i].name](transactions[i].data, req, user));
	// }


	function nextTransaction(){
		var t;
		if( transactions && transactions.length > 0 ){
			t = transactions.shift();
			console.log('Next transaction', t);
		}else{
			t = undefined;
		}
		
		if(t){
			console.log(new Date(), ' Applying ', t.name);

			// this handles playbacks that is regiestered manually - 
			// not through a model pairing
			if(!model[t.name]){
				executePlayback(t.name, t.data, req).then(function(){
					console.log('In finally!');
					nextTransaction();
				}, function(){
					console.log('In finally!');
					nextTransaction();
				})
			}else{
				model[t.name](t.data, req, user)
					.then(function(){ nextTransaction(); });
			}
		}else{
			console.log(new Date(), 'All transactions successfully synced', 'New version: ', user.transactions.length);

			// if we have a resync - a sync from
			// an empty device, we go ahead and 
			// send the whole data object instead
			// of the transactions
			if( version == 0 ){
				module.exports.resyncCallback({resyncData: {}, syncVersion: user.transactions.length, req: req, res:res});
			}else{
				res.send({transactions: sendTransactions, syncVersion: user.transactions.length});
			}

		}
	}

	nextTransaction();
}

module.exports.pair = function(model, commands) {

	for (var i = commands.length - 1; i >= 0; i--) {

		// create a scope to save
		// the command name to be
		// available for the given
		// command running.
		(function() {
			// add a wrapper to the original function
			var command = commands[i];

			// save the original func in private var
			model['_' + command] = model[command];
			model[command] = function(data, req, user) {
				var defer = Q.defer();
				
				// if the command is successfull
				// we record the transaction.
				model['_' + command](data, function(valid) {
					
					if (valid) {
						console.log('Saving transaction', data);
						user.transactions.push({
							name: command,
							data: JSON.stringify(data),
							time: data.time
						});
						user.syncVersion = user.transactions.length;

						user.save(function(){
							defer.resolve();
						})

					}else{
						defer.resolve();
					}
				}, req)

				return defer.promise;
			}
		})();
	}
}

