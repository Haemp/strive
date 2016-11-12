(function(){

	angular.module('Strive')

	.directive('monitorPublic', function(MonitorModel) {
		return {
			restrict: 'E',
			scope: {
				monitor: '=?'
			},
			templateUrl: 'src/modules/monitor/monitor-public.html',
			link: function(scope) {
				scope.selectMonitor = MonitorModel.selectMonitor;
			}
		}
	})

})()


