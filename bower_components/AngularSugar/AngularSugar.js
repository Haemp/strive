var AngularSugar = angular.module('AngularSugar', []);

AngularSugar.directive('asEnter', function($parse){

	return{
		link: function( $scope, element, attr ){

			element.on('keyup', function( e ){
				if( e.keyCode == 13 ){
					$scope.$apply($parse(attr.asEnter));
				}
			})
		}
	}
});

AngularSugar.directive('asEsc', function($parse){

	return{
		link: function( $scope, element, attr ){

			element.on('keyup', function( e ){
				if( e.keyCode == 27 ){
					$scope.$apply($parse(attr.asEsc));
				}
			})
		}
	}
});

AngularSugar.service('Browser', function(){
	var self = this;
	self.isAndroidBrowser = ((navigator.userAgent.indexOf('Mozilla/5.0') > -1 && navigator.userAgent.indexOf('Android ') > -1 && navigator.userAgent.indexOf('AppleWebKit') > -1) && !(navigator.userAgent.indexOf('Chrome') > -1));
});

AngularSugar.service('asUtility', function(){
	var self = this;

	self.pollFunction = function( callFunction, interval, initial ){

		function pollingFunction(){
			$timeout(function(){
				callFunction();
				pollingFunction();
			},interval)
		}
		pollingFunction();

		if( initial )
			callFunction();
	}

});


AngularSugar.directive('asTouchActive', function(){
	return{
		link: function( $scope, element, attr ){
			element.on('touchstart', function(){
				element.addClass('active');
			});
			element.on('touchmove', function(){
				element.removeClass('active');
			});
			element.on('touchend', function(){
				element.removeClass('active');
			})
		}
	}
});
