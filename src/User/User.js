angular.module('User', [])

.service('UserOptions', function(){
	var self = this;
	self.URL_SIGNUP = '/api/signup';
	self.URL_LOGIN = '/api/login';
})

.service('UserModel', function(UserOptions, $http){
	var self = this;
	self.loggedIn;

	self.login = function(email, password){
		var p = $http({ 
				url: UserOptions.URL_LOGIN, 
				method: 'POST',
				data: {username: email, password:password}
			})
			.then(function(res){
				console.log('successful login');
				self.loggedIn = true;
			})
		return p;
	}

})

.controller('LoginCtrl', function($scope, $rootScope, UserModel){
	
	var self = this;
	$scope.noti;
	self._init = function(){

		$rootScope.$on('User.LOGIN_SUCCESS', self.notification);
		$rootScope.$on('User.LOGIN_ERROR', self.notification);
		$rootScope.$on('User.LOGIN_PROGRESS', self.notification);

		$rootScope.$on('User.VALIDATION_ERROR', self.notification);

		$rootScope.$on('User.SIGNUP_SUCCESS', self.notification);
		$rootScope.$on('User.SIGNUP_ERROR', self.notification);
		$rootScope.$on('User.SIGNUP_PROGRESS', self.notification);
	}

	self.notification = function(e, noti){
		
		console.log(noti);
		$scope.noti = noti;	
	}

	$scope.login = function( user ){

		console.log(user);		
		if( !user || !user.password || !user.email  ){
			$rootScope.$emit('User.VALIDATION_ERROR', {text: 'You must enter email and password', type:'error'});
			console.log('No user set');
			$scope.error = true;
			return;
		}
		console.log('Login process');
		$rootScope.$emit('User.LOGIN_PROGRESS', {text: 'Figuring out if thou art worthy', type:'progress'});
		UserModel.login(user.email, user.password)
			.then(function(){
				$rootScope.$emit('User.LOGIN_SUCCESS', {text: 'Welcome sir', type:'success'});
			}, function(){
				$rootScope.$emit('User.LOGIN_ERROR', {text: 'You have no power here, Gandalf the gray!', type:'error'});
			})
	}

	self._init();
})