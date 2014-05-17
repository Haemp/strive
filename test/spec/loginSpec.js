describe('User login', function() {
	console.log = function(){};
	var $rootScope,
		$scope,
		loginScreen,
		$compile,
		LoginCtrl,
		$sniffer,
		UserOptions,
		loginButton,
		$templateCache;


	beforeEach(function() {
		module('User');
		module('strive.templates');

		this.addMatchers({
			// we need to use toEqualData because the Resource hase extra properties
			// which make simple .toEqual not work.
			toEqualData: function(expect) {
				return angular.equals(expect, this.actual);
			},
			expectEvent: function(eventName) {
				
				if (!$rootScope.$emit.mostRecentCall.args) {
					throw new Error('Expected '+eventName+', but $emit was never called');
				}
				return $rootScope.$emit.mostRecentCall.args[0] == eventName
			}
		});

		inject(function(_$rootScope_, _$compile_, _$templateCache_, $controller, _UserOptions_, _$httpBackend_) {

			$compile = _$compile_;
			UserOptions = _UserOptions_;
			$rootScope = _$rootScope_;
			$httpBackend = _$httpBackend_;
			$templateCache = _$templateCache_;
			$scope = $rootScope.$new();
			
			spyOn($rootScope, '$emit').andCallThrough();
			// create controller 
			loginScreen = $compile(angular.element($templateCache.get('src/user/login-signup.html')))($scope);
			$scope.$digest();
			loginButton = loginScreen.find('[ng-click="login(loginUser)"]');
			signupButton = loginScreen.find('[ng-click="signup(loginUser)"]');
			LoginCtrl = $controller('LoginCtrl', {$scope: $scope});
		});
	});

	afterEach(function(){
		// $httpBackend.verifyNoOutstandingExpectation();
		// $httpBackend.verifyNoOutstandingRequest();
	});

	it('Should show an error message if you try to login wihout user credentials', function() {

		var e = $(loginScreen).find('[ng-click="login(loginUser)"]');
		e.trigger('click');
		$scope.$digest();

		expect().expectEvent('User.VALIDATION_ERROR');
		expect(loginScreen.find('.Noti_error').length).toBe(1);
	})

	it('Should show an error message if you try to login wihout email', function() {

		loginScreen.find('[ng-model="loginUser.password"]')
			.val('1234')
			.trigger('input');

		var e = $(loginScreen).find('[ng-click="login(loginUser)"]');
		e.trigger('click');
		$scope.$digest();

		expect().expectEvent('User.VALIDATION_ERROR');
		expect($(loginScreen).find('.Noti_error').length).toBe(1);
	})

	it('Should attempt to create a user if you click signup', function() {

		$httpBackend.expect('POST', UserOptions.URL_SIGNUP, function(message){
			return message.indexOf('hampus') != -1 && message.indexOf('1234') !=  -1;
		})
			.respond(200);

		loginScreen.find('[ng-model="loginUser.email"]')
			.val('hampus')
			.trigger('input');

		loginScreen.find('[ng-model="loginUser.password"]')
			.val('1234')
			.trigger('input');

		signupButton.trigger('click');

		expect().expectEvent('User.SIGNUP_PROGRESS');

		$httpBackend.flush();
		$scope.$digest();

		expect().expectEvent('User.SIGNUP_SUCCESS');
		expect(loginScreen.find('.Notification_success').length).toBe(1);
	})

	it('Should notify the user if the login was successful', function(){
		$httpBackend.expect('POST', UserOptions.URL_LOGIN, function(message){
			return message.indexOf('hampus') != -1 && message.indexOf('1234') !=  -1;
		})
			.respond(200);

		loginScreen.find('[ng-model="loginUser.email"]')
			.val('hampus')
			.trigger('input');

		loginScreen.find('[ng-model="loginUser.password"]')
			.val('1234')
			.trigger('input');

		loginButton.trigger('click');
		$scope.$digest();

		expect().expectEvent('User.LOGIN_PROGRESS');
		expect(loginScreen.find('.Noti_progress').length).toBe(1);		
		$httpBackend.flush();
		$scope.$digest();

		expect().expectEvent('User.LOGIN_SUCCESS');
		expect(loginScreen.find('.Noti_success').length).toBe(1);
	})

	it('Should notify the user if the login was not successful', function(){
		$httpBackend.expect('POST', UserOptions.URL_LOGIN, function(message){
			return message.indexOf('hampus') != -1 && message.indexOf('1234') !=  -1;
		})
			.respond(500);

		loginScreen.find('[ng-model="loginUser.email"]')
			.val('hampus')
			.trigger('input');

		loginScreen.find('[ng-model="loginUser.password"]')
			.val('1234')
			.trigger('input');

		loginButton.trigger('click');
		$scope.$digest();
		
		expect().expectEvent('User.LOGIN_PROGRESS');
		expect(loginScreen.find('.Noti_progress').length).toBe(1);		
		$httpBackend.flush();
		$scope.$digest();

		expect().expectEvent('User.LOGIN_ERROR');
		expect(loginScreen.find('.Noti_error').length).toBe(1);
	})






















});