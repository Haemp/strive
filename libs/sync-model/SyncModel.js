angular.module('SyncModel', ['JsonStorage'])

.constant('URL_SYNC', undefined)

.service('SyncOptions', function(){
	var self = this;

	/**
	 * @param Imediatly after an action is recorded - should we try to sync?
	 */
	self.autoSync = true;
})

/**
 *
 */
.service('SyncModel', ['$http','TransactionModel', 'URL_SYNC', '$rootScope', '$timeout', 'SyncOptions',
	function($http, TransactionModel, URL_SYNC, $rootScope, $timeout, SyncOptions) {
		var self = this;
		self.models = {};
		self.playbacks = {};
		self.isSyncing = false;


		/**
		 * Sets methods on an object to be recordable
		 */
		self.record = function(model, methods) {

			for (var i = methods.length - 1; i >= 0; i--) {
				self.models[methods[i]] = model; // save in hashmap for play retreival

				// create a scope to save
				// the method name to be
				// available for the given
				// method running.
				(function(){
					// add a wrapper to the original function
					var method = methods[i];

					// save the original func in private var
					model['_' + method] = model[method];
					model[method] = function(data) {

						// if the method is successfull
						// we record the transaction.

						model['_' + method](data, function(valid) {
							if (valid) {
								TransactionModel.push({
									name: method,
									data: data,
									time: Date.now()
								});

								if(SyncOptions.autoSync === true){
									self.sync();
								}
							}
						})
					}
				})();
			}
		}

		self.recordManual = function(transName, data){
			TransactionModel.push({
				name: transName,
				data: data,
				time: Date.now()
			})

			if(SyncOptions.autoSync === true){
				self.sync()
			}
		}

		self.registerPlayback = function(transName, callback){
			self.playbacks[transName] = callback;
		}

		/**
		 * Sends all the transactions to server
		 * @return {[type]} [description]
		 */
		self.sync = function(){
			console.log('Syncing...');
			if(self.isSyncing){
				return console.log('Is already sycning...'); 
			}
			console.log('Syncing Up...', TransactionModel.transactions, 'with syncVersion', TransactionModel.syncVersion);
			self.isSyncing = true;
			return $http({
				method: 'POST',
				url: URL_SYNC,
				data: {
					transactions: TransactionModel.get(),
					version: TransactionModel.syncVersion
				},
				withCredentials: true
			})
				.then(function(res){

					// after sync reset the transactions
					// TODO: if an actino is performed
					// in the middle of a sync it will be
					// lost
					if( TransactionModel.transactions && TransactionModel.transactions.length > 0){
						console.log('Clearing transaction Model, all should now be synced');
						TransactionModel.clearTransactions();
					}
					
					
					
					if( res.data.transactions && res.data.transactions.length > 0 ){
						console.log('Playing ', res.data.transactions);
						self.play(res.data.transactions);
					}


					if( res.data.syncVersion != TransactionModel.syncVersion ){
						console.log('Playing updating syncVersion', res.data.syncVersion);
						TransactionModel.setVersion(res.data.syncVersion);
					}
					
					if( res.data.resyncData ){
						// TODO: this is a resync - not based on transactions
						$rootScope.$emit('SyncModel.SYNC_COMPLETE', {version: res.data.syncVersion, resyncData: res.data.resyncData});
					}else{
						$rootScope.$emit('SyncModel.SYNC_COMPLETE', {transactions: res.data.transactions, version: res.data.syncVersion});
					}
					
					
				}).finally(function(){
					self.isSyncing = false;
				})
		}

		/**
		 * Used for translating received transactions into
		 * model data. This way around we don't want to
		 * update the transactions - since it's not something
		 * we want to push back to the server.
		 *
		 * We use the private (non recorded) version of the
		 * method by prefixing the method with '_';
		 *
		 * @param  {[type]} transactions [description]
		 * @return {[type]}              [description]
		 */
		self.play = function( transactions ){
			console.log('Playing transactions', transactions);
			if(!transactions) return;

			// Wrap this loop in 60 fps recursive func
			var i = 0;
			(function runrunrunrun(){

				var t = transactions[i];

				console.log('Playing back', t);
				var model = self.models[t.name];

				// case: manual registered transaction
				if(!model){	

					// execute registered callback
					self.playbacks[t.name](JSON.parse(t.data))
					
					if(i < transactions.length-1){
						i++;
						$timeout( runrunrunrun, 1000/30);
					}
				}else{					
					model['_'+t.name](JSON.parse(t.data), function(){});

					if(i < transactions.length-1){
						i++;
						$timeout( runrunrunrun, 1000/30);
					}
				}
			})()
		}
	}
])

.run(function(TransactionModel){

})

.service('TransactionModel', function(JsonStorage, $rootScope, $q){
	var self = this;


	self.transactions = [];
	self.syncVersion = 0;
	console.log('TransactionModel instantiated transactions and version are now [] and 0');
	self.initiated = false;
	
	self._init = function(){
		self._load();
	}

	self.isInitiated = function(){
		var d = $q.defer();

		var f = $rootScope.$watch(function(){
			return self.initiated;
		}, function(newVal){
			if(newVal == true){
				d.resolve();

				// no need to watch this more
				f();
			}
		})

		return d.promise;
	}

	self.isEmpty = function(){
		return self.transactions.length < 1;
	}
	self.push = function(t){
		self.transactions.push(t);
		self._save();
	}
	self.clearTransactions = function(){
		self.transactions.length = 0;
		console.log('Clearing transactions...');
		JsonStorage.serial_save('transactions', angular.copy(self.transactions));
	}
	self.clear = function(){
		console.log('Clearing trans and version...');
		self.transactions.length = 0;
		self.syncVersion = 0;
		self._save();
	}

	self.get = function(){
		return self.transactions;
	}

	self.setVersion = function(v){
		self.syncVersion = v;
		self._save();
	}

	self.getVersion = function(){
		return self.syncVersion;
	}

	self._load = function(){
		console.log('Loading SyncModel data...');

		var p1 = JsonStorage.serial_get('transactions').then(function(t){
			if( typeof t == 'string') t = [];
			self.transactions = t || [];

			console.log('Transactions loaded!', self.transactions);
		});
		var p2 = JsonStorage.serial_get('syncVersion').then(function(v){
			self.syncVersion = parseInt(v || 0);
			console.log('Sync Version loaded!', self.syncVersion);
		});

		return $q.all(p1, p2).then(function(){
			self.initiated = true;
		})
	}

	self._save = function(){
		JsonStorage.serial_save('transactions', angular.copy(self.transactions));
		JsonStorage.serial_save('syncVersion', self.syncVersion);
	}

	self._init();
})
