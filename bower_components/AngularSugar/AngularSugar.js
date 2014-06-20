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

AngularSugar.service('asUtility', function( $timeout ){
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


/**
	- Chrome does not register active on touch
	- IOS activates the :active but does not disable on drag = list scroll flicker

	Algorithm
		- Detect on on touch start on a target element
		- Then we trigger a timeout to make sure there is room
		  to register some move events in the case of a drag
		- We add an event listener for a global touch move - to be able
		  to detect a move event outside the given element
		- We also attach a global event for touchend to cancel the active effect
		  and clear the event listeners


	Alternate strategy
		- Listen for touchend on the event
		- Flash active state for x ms

**/
AngularSugar.directive('asTouchActive', function( $timeout, $document ){
	return{
		link: function( $scope, element, attr ){

			var moved = false;
			var active = false;
			element.on('touchstart', function(){
				$document.unbind('touchmove');

				// delay execution to make sure we don't
				// get active states when the user intended to
				// scroll
				$timeout(function(){
					if( !moved ){

						element.addClass('active');
						active = true;

						// active class is flashed only 100 ms
						// enough for interface feedback and
						// a lot simpler than to handle
						// touchend separatly.
						$timeout(function(){
							active = false;
							moved = false;
							element.removeClass('active');
						}, 100);

					}else{
						$document.unbind('touchmove');
						moved = false;
						element.removeClass('active');
					}

				}, 50);

				// bind on document to make sure
				// we get the move even if its
				// outside of the main element
				$document.on('touchmove', function(){
					$document.unbind('touchmove'); // trigger only once.

					// move is triggered after the timer is triggered
					// in this case we should not set moved to indicate
					// since it is already too late.
					if(!active){
						moved = true;
					}

					element.removeClass('active');
				});

			});
		}
	}
});

/**
	This works great for persistant interface components but not for ones
	that transitions to a different view. It's too slow.
**/
AngularSugar.directive('asActive', function( $timeout, $document ){
	return{
		link: function( $scope, element, attr ){
			element.on('touchend', function(el){
				element.addClass('active');
				$timeout(function(){
					element.removeClass('active');
				}, 300);
			});
		}
	}
});

AngularSugar.service('PromiseSerializer', function( $q ){

	var self = this;

	self.decorate = function(obj, methods){
		obj.lastPromise = $q.when();
		for(var i = 0; i < methods.length; i++){
			
			(function(){
				var index = i;
				obj['serial_'+methods[index]] = function(){
					
					var params = arguments;
					
					obj.lastPromise = obj.lastPromise.then(function(){ 
						return obj[methods[index]](params[0], params[1], params[2], params[3], params[4]);
					}, function(){
						return obj[methods[index]](params[0], params[1], params[2], params[3], params[4]);
					})	
					
					return obj.lastPromise;
				}
			})()	
		}
	}
})
