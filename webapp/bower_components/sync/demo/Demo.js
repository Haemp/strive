angular.module('Demo', ['Sync'])

.run(function(SyncOptions, Sync){
 	SyncOptions.downSync = {url: 'http://localhost:3000/api/habit', method: 'GET', withCredentials: true};
 	SyncOptions.flushInterval = 50000;
 	Sync.syncAuto();
})

.controller('DemoCtrl', function($scope, $rootScope, Sync, RequestModel, $http){

   $scope.RequestModel = RequestModel;

   self._init = function(){
   		$rootScope.$on('Sync.DOWNSYNC_COMPLETE', function(e, data){
   			console.log('Downsync data', data);
   			$scope.habits = data;
   		});


   	  $http({
   	  	method: 'GET',
   	  	url: 'http://localhost:3000/api/habit',
   	  	withCredentials: true
   	  }).then(function(res){
   	  	$scope.habits = res.data;
   	  });
   }
   $scope.flush = function(){
      Sync.syncManual();
   }

   $scope.clearAll = Sync.clearAll;

   $scope.batch = function( req ){
      req.withCredentials = true;
      req.url = 'http://localhost:3000' + req.url;
      req.data = angular.copy(JSON.parse(req.data));
      Sync.batch(req);

      $scope.newRequest = undefined;
   }

   $scope.tickHabit = function(habit){
   		Sync.batch({ 
	   	  	url:'http://localhost:3000/api/habit/tick', 
	   	  	method: 'POST', 
	   	  	data: {
	   	  		"habitId": habit.id,
		   	  	"id": Date.now(),
		   	  	"createdAt": Date.now()
	   	  	},
	   	  	withCredentials:true
	   	});
   }

   $scope.addHabit = function(name){
   		Sync.batch({ 
	   	  	url:'http://localhost:3000/api/habit', 
	   	  	method: 'POST', 
	   	  	data: {
		   	  	"id": Date.now(),
		   	  	"name": name,
		   	  	"createdAt": Date.now()
	   	  	},
	   	  	withCredentials:true
	   	});
   }

   $scope.removeHabit = function(id){
   		Sync.batch({ 
	   	  	url:'http://localhost:3000/api/habit', 
	   	  	method: 'DELETE', 
	   	  	params: {
		   	  	"id": id
	   	  	},
	   	  	withCredentials:true
	   	});
   }

   $scope.saveHabit = function(habit){
   		Sync.batch({ 
	   	  	url:'http://localhost:3000/api/habit', 
	   	  	method: 'PUT', 
	   	  	data: habit,
	   	  	withCredentials:true
	   	});
   }
   self._init();
});
