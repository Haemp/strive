angular.module('User', [])

.service('UserOptions', function() {
	var self = this;
	self.URL_LOGIN = '/api/login';
	self.URL_LOGOUT = '/api/logout';
	self.URL_LOGOUT = '/api/export';
})

.factory('userInterceptor', function($injector, $q) {
	return {
		'responseError': function(response) {
			console.log(response);
			if (response.status == 401) {
				UserModel = $injector.get('UserModel');
				console.log('User was invalidated by the server');
				UserModel.user = undefined;
			}
			return $q.reject(response);
		}
	};
})

.service('UserModel', function(UserOptions, $http) {
	var self = this;
	self.user;
	self.showUserLogin;

	self._init = function() {
		self.user = self.loadUser();
	}
	self.saveUser = function() {
		localStorage.user = JSON.stringify(angular.copy(self.user));
	}
	self.loadUser = function() {
		if (localStorage.user) {
			return JSON.parse(localStorage.user);
		}
		return undefined
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
			self.user = undefined;
			self.saveUser();
		});

		return p;
	}

	self._init();
})

.controller('LoginCtrl', function($scope, $rootScope, UserModel) {

	var self = this;
	$scope.noti;
	$scope.UserModel = UserModel;

	self._init = function() {

		$rootScope.$on('User.LOGIN_SUCCESS', self.notification);
		$rootScope.$on('User.LOGIN_ERROR', self.notification);
		$rootScope.$on('User.LOGIN_PROGRESS', self.notification);

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

				if (res.data.isNew) {
					$rootScope.$emit('User.SIGNUP_SUCCESS', {
						text: 'You have the power!',
						type: 'success',
						data: res.user
					});
				}else{
					$rootScope.$emit('User.LOGIN_SUCCESS', {
						text: 'Welcome sir',
						type: 'success'
					});
				}

			}, function() {
				$rootScope.$emit('User.LOGIN_ERROR', {
					text: 'You have no power here, Gandalf the gray!',
					type: 'error'
				});
			})
	}

	self._init();
})