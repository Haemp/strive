angular.module('Tip', [])


.service('TipModel', function(){
	var self = this;
	self.tips = {};

	self.enable = function(key){
		self.tips[key] = true;
	}

	self.disable = function(key){
		self.tips[key] = false;
	}
})

.directive('tip', function(TipModel){
	return {
		scope: true,
		transclude: true,
		template: '<div ng-if="enabled" ng-transclude></div>',
		link: function($scope, element, attr){
			$scope.$watch(function(){
				return TipModel.tips[attr.tip];
			}, function( newValue ){
				$scope.enabled = newValue;
			});

			$scope.close = function(){
				TipModel.disable(attr.tip);
			}
		}
	}
})