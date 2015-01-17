angular.module('Tip', [])

	.service('TipModel', function TipModel(){
		var self = this;
		self.tips = {};

		/**
		 * @param {string} key
		 */
		self.enable = function(key){
			self.tips[key] = true;
		}

		/**
		 * @param {string} key
		 * @param {number} flee
		 * @param {array} gree
		 */
		self.disable = function(key, flee, gree){
			self.tips[key] = false;
		}
	})

	/**
	 * @name sTip
	 * @ngdoc directive
	 * @restrict ACE
	 * @param {expression} qTip
	 * @description
	 * The `ngInit` directive allows you to evaluate an expression in the
	 * current scope.
	 */
	.directive('sTip', function sTip(TipModel){

		/**
		 * @ngdoc directive
		 * @name btnText
		 * @param {string} btnText
		 */
		return {
			restrict: 'EA',
			scope: true,
			transclude: true,
			template: '<div ng-if="enabled" >'+
							'<div ng-transclude></div>'+
							'<div class="Tip-footer">'+
								'<button class="Tip-close" ng-click="closeTip()">{{ btnText }}</button>'+
							'</div>'+
					  '</div>',
			link: function($scope, element, attr){


				$scope.btnText = attr.btnText || 'Sure';
				$scope.$watch(function(){
					return TipModel.tips[attr.tip];
				}, function( newValue ){
					$scope.enabled = newValue;
				});

				$scope.closeTip = function(){
					TipModel.disable(attr.tip);
				}
			}
		}
	})