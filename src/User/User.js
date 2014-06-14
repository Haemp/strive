angular.module('User', ['JsonStorage'])

.service('UserOptions', function() {
	var self = this;
	self.URL_LOGIN = '/api/login';
	self.URL_LOGOUT = '/api/logout';
	self.URL_EXPORT = '/api/export';
})

.factory('userInterceptor', function($injector, $q) {
	return {
		'responseError': function(response) {
			console.log(response);
			if (response.status == 401) {
				UserModel = $injector.get('UserModel');
				
				if( UserModel.user && UserModel.user.authorized ){
					console.log('User was invalidated by the server and now set as unauthorized');
					UserModel.user.authorized = false;	
					UserModel.saveUser();
				}
			}
			return $q.reject(response);
		}
	};
})

.service('UserModel', function(UserOptions, $http, JsonStorage, TransactionModel) {
	var self = this;
	self.user;
	self.showUserLogin;

	self._init = function() {
		self.loadUser();
	}
	self.saveUser = function() {
		
		console.log('Saving user', self.user);
		JsonStorage.save('user', angular.copy(self.user));
	}
	self.loadUser = function() {
		JsonStorage.get('user')
			.then(function(user){
				 
				console.log('Loading user', user);
				self.user = user;
			});
		
	}
	
	self.login = function(email, password) {
		var p = $http({
			url: UserOptions.URL_LOGIN,
			method: 'POST',
			withCredentials: true,
			data: {
				username: email,
				password: password
			}
		}).then(function(res) {

			self.user = res.data.user;
			self.user.authorized = true;
			delete self.user['transactions'];
			self.saveUser();
			
			return res;
		});
		return p;
	}

	self.export = function( habitData, monitorData ){

		return $http({
			url: UserOptions.URL_EXPORT,
			method: 'POST',
			data: {habitData: habitData, monitorData:monitorData},
			withCredentials: true
		});
	}

	self.logout = function() {
		var p = $http({
			url: UserOptions.URL_LOGOUT,
			method: 'GET',
			withCredentials: true
		}).then(function(res) {
			
			// clears user
			self.user = undefined;
			
			// resets the sync model - all non
			// synced changes will be lost
			TransactionModel.clear();
			self.saveUser();
		});

		return p;
	}

	self._init();
})

.controller('LoginCtrl', function($scope, $rootScope, UserModel, $timeout) {

	var self = this;
	$scope.noti;
	$scope.UserModel = UserModel;

	self._init = function() {

		$rootScope.$on('User.LOGIN_SUCCESS', self.notification);
		$rootScope.$on('User.LOGIN_ERROR', self.notification);
		$rootScope.$on('User.LOGIN_PROGRESS', self.notification);
		$rootScope.$on('User.SIGNUP_SUCCESS', self.notification);

		$rootScope.$on('User.VALIDATION_ERROR', self.notification);
	}

	self.notification = function(e, noti) {
		$scope.noti = noti;
	}

	$scope.login = function(user) {

		if (!user || !user.password || !user.email) {
			$rootScope.$emit('User.VALIDATION_ERROR', {
				text: 'You must enter email and password',
				type: 'error'
			});
			console.log('No user set');
			$scope.error = true;
			return;
		}

		$rootScope.$emit('User.LOGIN_PROGRESS', {
			text: 'Figuring out if thou art worthy...',
			type: 'progress'
		});
		
		UserModel.login(user.email, user.password)
			.then(function(res) {
	
				$rootScope.$emit('User.LOGIN_SUCCESS', {
					text: 'Welcome sir',
					type: 'success'
				});
				
				// wait a bit after the notification displays
				// then roll up the login screen
				$timeout(function(){
					UserModel.showUserLogin = false;
					$scope.noti = undefined;
				},700);

			}, function() {
				$rootScope.$emit('User.LOGIN_ERROR', {
					text: 'You have no power here, Gandalf the gray!',
					type: 'error'
				});
			})
	}

	self._init();
})