Strive.controller('MonitorCtrl', function( $scope, MonitorModel ){

	$scope.newMonitor = undefined;
	$scope.newDataPoint = {};
	$scope.MonitorModel = MonitorModel;

	$scope.createMonitor = function(newMonitor){
		MonitorModel.createMonitor(newMonitor);
		$scope.newMonitor = undefined;
	}
	
	// $scope.addDataPoint = function( monitor, newDataValue ){
	// 	delete monitor.newDataValue; 

	// 	var dataPoint = {
	// 		createdAt: Date.now(),
	// 		value: parseFloat(newDataValue, 10),
	// 		monitorId: monitor.id
	// 	}

	// 	MonitorModel.addDataPoint( dataPoint );
		
	// }

	// $scope.hasDataPointToday = function( monitor ){
	// 	return MonitorModel.hasDataPointToday( monitor.id );
	// }

	// $scope.removeMonitor = function( habit ){
	// 	MonitorModel.removeMonitor(habit);
	// }
	// $scope.numDataPoints = function( monitor ){
	// 	return ( typeof monitor.dataPoints != 'undefined' ) ? monitor.dataPoints.length : 0;
	// }
	
	/** 
	 * Show the chart for all monitors that
	 * have atleast 1 data point
	 */
	
	// $scope.selectMonitor = function( monitor ){
	// 	if( $scope.selectedMonitor ){
	// 		delete $scope.selectedMonitor.selected;
	// 		delete $scope.selectedMonitor.isEditable;
	// 		delete $scope.selectedMonitor.confirmDelete;
	// 	}
			
		
	// 	if( $scope.selectedMonitor != monitor ){
	// 		monitor.selected = true;
	// 		$scope.selectedMonitor = monitor;	
	// 	}else{
	// 		$scope.selectedMonitor = undefined;
	// 	}
	// }

	// $scope.toggleEditMode = function( monitor ){
		
	// 	// if we go from editable to 
	// 	// non editable -> we save the 
	// 	// current state of all habits
	// 	monitor.isEditable = !monitor.isEditable;	
	// 	if( !monitor.isEditable ){
	// 		monitor.selected = false;	
	// 		MonitorModel.editMonitor(self._edit(monitor));
	// 		$scope.selectedMonitor = undefined;
	// 		self.saveAll();
	// 	}
	// }

});

Strive.controller('ChartCtrl', function( $scope, MonitorModel ){

	$scope.monitorChartData;

	$scope._init = function(){
		
		$scope.$watch('monitor.dataPoints.length', function(newValue, oldValue){
			
			if( newValue && oldValue != undefined && newValue != oldValue){
				console.log('New data point - refreshing', newValue, oldValue);
				self.refresh();
			}
		}) 
		
		self.refresh();
	}
	
	self.refresh = function(){
		var chartData = self.convertToD3Format($scope.monitor.dataPoints);
		
		if( !chartData ) return;
		nv.addGraph(function() {
		  var chart = nv.models.lineChart()
		
		  chart.xAxis
      		.tickFormat(function(d){ return d3.time.format("%d/%m")(new Date(d)) });
		
		  chart.yAxis
			 .tickFormat(d3.format('.3s'));
		
		  d3.select('#chart svg')
			.datum(chartData)
			.transition().duration(500)
			.call(chart);
		
		  return chart;
		});
	}
	
	self.convertToD3Format = function( dataPoints ){
		var data = [];
		if( !dataPoints || dataPoints.length < 1 ) return;
		for (var i = 0; i < dataPoints.length; i++) {
			data.push( {x: new Date(dataPoints[i].createdAt), y: parseFloat(dataPoints[i].value)} );
		}
		
		return [
			{ values: data, key: 'Ticks' }
		];
	}
	$scope._init();	
});

















