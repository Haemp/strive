describe('User login', function(){
	var $rootScope, 
		$scope, 
		loginScreen, 
		$compile, 
		LoginCtrl,
		$templateCache;

	
	beforeEach(function(){
		module('User');
		module('strive.templates');

		inject(function(_$rootScope_, _$compile_, _$templateCache_, $controller){
			
			$compile = _$compile_;

			$rootScope = _$rootScope_;
			$templateCache = _$templateCache_;
			$scope = $rootScope.$new();


			// create controller 
			LoginCtrl = $controller('LoginCtrl', {$scope: $scope});

			//console.log($templateCache.get('src/User/login-signup.html'));
			loginScreen = $compile($templateCache.get('src/User/login-signup.html'))($scope);
		});
	});	

	it('Should show an error message if you try to login or create a user wihout email', function(){

		var e = $(loginScreen).find('[ng-click="login(loginUser)"]');
		
		e.trigger('click');
		$scope.$digest();

		

		expect($(loginScreen).find('.Notification').length).toBe(1);
	})

	it('Should attempt to create a user if you click signup', function(){

	})
});