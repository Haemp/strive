//#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var hasher = require('password-hash');
var fs = require('fs');
var config = require('./config/config');

// db connect logic
//mongoose.connect('mongodb://127.0.0.1:27017/strivedb');


// Bootstrap db connection
// Connect to mongodb
var mongoose = require('mongoose');

var connect = function() {
	var options = {
		server: {
			socketOptions: {
				keepAlive: 1
			}
		}
	}
	mongoose.connect(config.db, options, (err) => {
		if(err) console.log('There was an error', err);
	})
}

connect();

mongoose.connection.on('open', function () {
	console.log('We have an open mongoose connection')
});
mongoose.connection.on('error', function(err) {
	console.log('Error mongoose connection', err)
})

// Reconnect when closed
mongoose.connection.on('disconnected', function() {
	connect()
})

// Bootstrap models
var models_path = __dirname + '/models'
console.log('Initiaing the schemas', models_path);
fs.readdirSync(models_path).forEach(function(file) {
	if(!file.includes('usync')){
		if(file.includes('.js')) {
			console.log('loading ', file);
			require(models_path + '/' + file)
		}
	}
});
require('./models/usync.js');

console.log('Setting up express config...');
require('./config/express');

console.log('Setting up passport config...');
require('./config/passport');



// self.createRoutes();
// self.app = express();
// self.app.use('/doc', express.static(__dirname + '/doc'));
// self.app.get('/doc', function(req, res) {
// 	console.log('Sending file');
// 	res.sendFile('/doc/global.html');
// });
//
// //  Add handlers for the app (from the routes).
// for (var r in self.routes) {
// 	self.app.get(r, self.routes[r]);
// }

// defined routes
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	var User = mongoose.model('User');
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

console.log('Setting up passport LocalStrategy...');
passport.use(new LocalStrategy({
		passReqToCallback: true
	},
	function(req, username, password, done) {
		var User = mongoose.model('User');

		// 1 check if the user exists
		User.findOne({
			username: username
		}, function(err, user) {

			if (err) {
				return done(err);
			}

			if (!user) {

				// user does not exist
				// then we assume that this
				// is a signup
				var user = new User({
					username: username,
					email: username,
					password: hasher.generate(password)
				});
				user.save(function(err) {
					if (err) {
						return done(null, false, {
							message: 'Could not sign up.',
							err: err
						});
					}
					console.log('Saving user');
					user.password = undefined;
					req.newUser = true;
					return done(null, user);
				})
			} else {

				if (!user.validPassword(password)) {
					console.log('Wrong password!');
					return done(null, false, {
						message: 'Incorrect password.'
					});
				}
				user.password = undefined;
				return done(null, user);
			}
		});
	}
));



console.log('Creating express...');
var app = express();

console.log('Configuring express...');
app.configure(function() {


	app.use(express.cookieParser());
	app.use(express.cookieSession({
		secret: 'cat in the hat',
		cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 }
	}));
	console.log('In configure...');
	app.use(express.json()); // to support JSON-encoded bodies
	app.use(express.urlencoded());
	/*app.use(express.session({
       secret:'secret',
       maxAge: new Date(Date.now() + 3600000),
       store: new MongoStore(
           {db:mongoose.connection.db},
           function(err){
               console.log(err || 'connect-mongodb setup ok');
           })
   }));*/
	app.use(passport.initialize());
	app.use(passport.session());
});

console.log('Setting routes...');
require('./config/routes')(app, passport);


app.listen(config.port, config.ipaddress, function() {
	console.log('%s: Node server started on %s:%d ...',
		Date(Date.now()), config.ipaddress, config.port);
});
