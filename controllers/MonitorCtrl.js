Strive.controller('MonitorCtrl', function( $scope, MonitorModel ){

	$scope.newMonitor = undefined;
	$scope.newDataPoint = {};
	$scope.MonitorModel = MonitorModel;
	
	$scope._init = function(){
		
		// load models
		MonitorModel.loadMonitors();
	}
	
	$scope.createMonitor = function( newMonitor ){
		MonitorModel.create( newMonitor );
		
		$scope.newMonitor = undefined;
	}

	$scope.addDataPoint = function( monitor, newDataValue ){
		delete monitor.newDataValue; 
		MonitorModel.addDataPoint( monitor.id, parseInt(newDataValue, 10) );
		
	}

	$scope.hasDataPointToday = function( monitor ){
		return MonitorModel.hasDataPointToday( monitor.id );
	}

	$scope.removeMonitor = function( habit ){
		MonitorModel.remove(habit);
	}
	$scope.numDataPoints = function( monitor ){
		return ( typeof monitor.dataPoints != 'undefined' ) ? monitor.dataPoints.length : 0;
	}
	
	/** 
	 * Show the chart for all monitors that
	 * have atleast 1 data point
	 */
	$scope.showChartForMonitor = function( monitor ){
		return (typeof monitor.dataPoints != 'undefined' && monitor.dataPoints.length > 0 )
	}
	$scope.selectMonitor = function( monitor ){
		if( $scope.selectedMonitor ){
			delete $scope.selectedMonitor.selected;
			delete $scope.selectedMonitor.isEditable;
			delete $scope.selectedMonitor.confirmDelete;
		}
			
		
		if( $scope.selectedMonitor != monitor ){
			monitor.selected = true;
			$scope.selectedMonitor = monitor;	
		}else{
			$scope.selectedMonitor = undefined;
		}
	}

	$scope.toggleEditMode = function( monitor ){
		
		// if we go from editable to 
		// non editable -> we save the 
		// current state of all habits
		monitor.isEditable = !monitor.isEditable;	
		if( !monitor.isEditable ){
			monitor.selected = false;	
			$scope.selectedMonitor = undefined;
			self.saveAll();
		}
	}

	self.saveAll = function(){
		MonitorModel.save()
	}
	
	$scope._init();	
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
      		.tickFormat(function(d){ return d3.time.format("%Y-%m-%d")(new Date(d)) });
		
		  chart.yAxis
			 .tickFormat(d3.format('f'));
		
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
			data.push( {x: new Date(dataPoints[i].createdAt), y: dataPoints[i].value} );
		}
		
		return [
			{ values: data, key: 'Ticks' }
		];
	}
	$scope._init();	
});

















