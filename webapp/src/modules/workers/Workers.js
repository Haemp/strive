(function(){

	angular.module('Workers', [])

	.service('Workers', function($q){

		var self = this;
		self.habitWorker;

		function init(){
			
			self.habitWorker = new Worker('/src/modules/workers/habitWorker.js');
			
			self.habitWorker.addEventListener('message', function(data){
				console.log('Resolving');
				self.d.resolve(data)
			})
		}

		self.postMessage = function(data){
			self.d = $q.defer();
			if( typeof Worker != 'undefined' ){
				self.habitWorker.postMessage(data);
			}

			return self.d.promise;
		}

		init();
	})

})()