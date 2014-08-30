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
		template: '<div ng-if="enabled" >'+
						'<div ng-transclude></div>'+
				  '</div>',
		link: function($scope, element, attr){
			$scope.$watch(function(){
				return TipModel.tips[attr.tip];
			}, function( newValue ){
				$scope.enabled = newValue;
			});
			$scope.testy = 'He hej hej!';
			$scope.closeTip = function(){
				TipModel.disable(attr.tip);
			}
		}
	}
})