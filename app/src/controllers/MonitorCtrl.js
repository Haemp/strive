Strive.controller('MonitorCtrl', function( $scope, MonitorModel ){

	$scope.newMonitor = undefined;
	$scope.newDataPoint = {};
	$scope.MonitorModel = MonitorModel;
    $scope.vm = {};
	$scope.createMonitor = function(newMonitor){
		MonitorModel.createMonitor(newMonitor);
		$scope.vm.newMonitor = null;
	}

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

















