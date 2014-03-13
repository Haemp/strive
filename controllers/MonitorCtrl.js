Strive.controller('MonitorCtrl', function( $scope, MonitorModel ){

	$scope.newMonitor = undefined;
	$scope._init = function(){
		
		// load models
		MonitorModel.loadMonitors();
	}
	
	$scope.createMonitor = function( newMonitor ){
		MonitorModel.create( newMonitor );
	}
	$scope._init();	
});