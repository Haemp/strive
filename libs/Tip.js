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