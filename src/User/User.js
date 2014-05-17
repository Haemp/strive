angular.module('User', [])

.controller('LoginCtrl', function($scope){
	
	$scope.login = function( user ){

		if( !user ){
			$scope.error = true;
		}

		
		console.log('Logging in!');
	}
})