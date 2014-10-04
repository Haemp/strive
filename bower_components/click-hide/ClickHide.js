/**
 * @author: +HampusAhlgren
 * 
 * Click anywhere else but in the directive element and it will trigger
 * the given function. 
 * 
 */
var ClickHide = angular.module('ClickHide', []);

ClickHide.directive('clickHide', function( $document, $parse, $timeout ){

	return{
		link: function( $scope, element, attr ){
			var self = this;
			
			self._init = function(){

				$scope.$watch( attr.chActivate, self.onActivationChange );
			}

			self.onActivationChange = function( newValue ){
				
				if( newValue == true ){
					$scope.listenForClick();
				}
				// in the case that the user changed the activation
				// condition without clicking outside the parentElement
				// ex. Clicking close instead. We then wan't to make sure 
				// we unbind the click listener - otherwise we'll get some
				// funky behaviour.
				else if( newValue == false ){
					$document.unbind('click', $scope.onClick);
				} 
			}

			$scope.listenForClick = function(){
				
				$timeout(function(){
					$document.on('click', $scope.onClick);	
				}, 10);
			}

			/**
			 * First click after activating. 
			 */
			$scope.onClick = function( e ){
				e.preventDefault();
				e.stopImmediatePropagation();

				// check if the user has clicked outside of the 
				// element
				if( !self._isDecendantOfParent(e.target, element) ){ // yes he did

					// parse and execute the click
					// action
					$scope.$apply(function(){
						$parse(attr.chClick)($scope);	
					});
					
					$document.unbind('click', $scope.onClick); // now we don't have to listen anymore
				}
			}
			
			/**
			 * 
			 */
			self._isDecendantOfParent = function( decendantElement, parentElement ){
				
				var currentParent = decendantElement; 
				while( currentParent ){
					if( currentParent == parentElement[0]){ return true }
					
					currentParent = currentParent.parentNode;
				}
				return false;
			}
			self._init();
		}
	}
});