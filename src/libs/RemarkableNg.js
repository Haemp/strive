
(function(){

	angular.module('RemarkableNg', ['ngSanitize'])

	.service('RemarkableHelper', function(){
		if( typeof Remarkable === 'undefined' ) throw new Error();
		var self = this;
		self.r = new Remarkable('full', {html: true});
	})

	.directive('remarkable', function(RemarkableHelper){
		return {
			restrict: 'E',
			scope: {
				text: '=?'
			}, 
			template: '<div class="RemarkableNg" ng-bind-html="_text"></div>',
			link: function(scope){
				scope.$watch('text', function(newVal){
					if(newVal){
						scope._text = RemarkableHelper.r.render(newVal);
					}
				})
			}
		}
	})

})()