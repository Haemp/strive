var Basement = angular.module('Basement', ['ClickHide']);
/**
 * Handles slide from the left to trigger the basement. We base it on the dragRight
 * Hammerjs event and if the user has dragged far enough right we trigger the basement
 */
Basement.directive('basement', function($document, $parse) {
	if (Hammer == 'object') throw new Error('Needs moar Hammerjs! http://eightmedia.github.io/hammer.js/');

	return {
		restrict: 'E',
		scope: {
			open: '=?'
		},
		replace: true,
		transclude: true,
		template: '<div class="Basement" click-hide ch-activate="open == true" ch-click="open = false" click ng-transclude ng-class="{\'Basement_open\': open}">' +

			'</div>',
		link: function($scope, element, attr) {

			var self = this;

			var startPos;
			var endPos;


			// swipey swipey?
			var gestureEnabled = true;
			if ($parse(attr.gesture) === false) {
				gestureEnabled = false
			}

			self.boundSize = 100;
			self._init = function() {

				// listen for a global slide in from the left
				// if we have gestures enabled
				if (gestureEnabled) {
					Hammer($document[0]).on('dragright', self.onDragRight);
					Hammer(element[0]).on('dragleft', self.onDragLeft);
				}
                //
				//$document.on('touchstart', self.onMouseDown);
				//$document.on('touchend', self.onMouseUp);
			}

			/**
			 * Open sesame
			 */
			self.onDragRight = function(e) {

				// is the start coord within the left most bound?
				var gesture = e.gesture
				if (gesture.startEvent.center.pageX < self.boundSize) {

					$scope.$apply(function() {
						$scope.open = true;
					});
				}
			}

			self.onDragLeft = function() {
				$scope.$apply(function() {
					$scope.open = false;
				});
			}
			
			self.onMouseDown = function(e){
				startPos = -360;
				endPos = 0;
				if (e.originalEvent.touches[0].pageX < self.boundSize) {
					console.log('Hooking in');
					$document.on('touchmove', self.onMouseMove);
				}
			}
			
			self.onMouseMove = function(e){
				e.preventDefault();
				endPos = e.originalEvent.changedTouches[0].pageX + startPos;
				element[0].style.transform = 'translateX('+endPos+'px)';
				// element.animate([
				// 	{transform: 'translateX('+startPos+'px)'},
				// 	{transform: 'translateX('+endPos+'px)'},
				// ], 100)
				// startPos = endPos;
				//console.log('Updating X', e.originalEvent.touches[0].pageX);
			}

			self.onMouseUp = function(){
				console.log('Releasing');
				$document.unbind('mousemove', self.onMouseDown);	
			}

			self._init();
		}
	}
});
