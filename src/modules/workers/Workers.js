(function(){

	angular.module('Workers', [])

	.service('Workers', function($q){

		var self = this;
		self.habitWorker;

		self._init = function(){
			if( chrome.storage ){ // if in phone
				self.habitWorker = new Worker('/src/modules/workers/habitWorker.js');
			}else{
				self.habitWorker = new Worker('/amplex/src/modules/workers/habitWorker.js');
			}
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

		self._init();
	})

})()