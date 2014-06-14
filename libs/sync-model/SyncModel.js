angular.module('SyncModel', ['JsonStorage'])

.constant('URL_SYNC', undefined)
/**
 *
 * @return {[type]} [description]
 */
.service('SyncModel', ['$http','TransactionModel', 'URL_SYNC', '$rootScope',
	function($http, TransactionModel, URL_SYNC, $rootScope) {
		var self = this;
		self.models = {};

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
							}
						})
					}
				})();
			}
		}

		/**
		 * Sends all the transactions to server 
		 * @return {[type]} [description]
		 */
		self.sync = function(){
			console.log('Syncing Up...', TransactionModel.transactions, 'with syncVersion', TransactionModel.syncVersion);
			$http({
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
						console.log('Playing updating syncVersion');
						TransactionModel.setVersion(res.data.syncVersion);
					}
						
					$rootScope.$emit('SyncModel.SYNC_COMPLETE', {transactions: res.data.transactions, version: res.data.syncVersion});
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

			for (var i = 0; i < transactions.length; i++) {
				var t = transactions[i]
				var model = self.models[t.name];
				model['_'+t.name](JSON.parse(t.data), function(){});
			};
		}
	}
])

.run(function(TransactionModel){

})

.service('TransactionModel', function(JsonStorage){
	var self = this;
	
	
	self.transactions = [];
	self.syncVersion = 0;
	console.log('TransactionModel instantiated transactions and version are now [] and 0');
	
	self._init = function(){
		self._load();
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
		JsonStorage.save('transactions', angular.copy(self.transactions));
	}
	self.clear = function(){
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
		JsonStorage.get('transactions')
			.then(function(t){
				if( typeof t == 'string') t = [];
				self.transactions = t || [];
				
				console.log('Transactions loaded!', self.transactions);
			});

		JsonStorage.get('syncVersion')
			.then(function(v){
				
				
				self.syncVersion = parseInt(v || 0);
				console.log('Sync Version loaded!', self.syncVersion);
			});
	}

	self._save = function(){
		JsonStorage.save('transactions', angular.copy(self.transactions));
		JsonStorage.save('syncVersion', self.syncVersion);
	}

	self._init();
})