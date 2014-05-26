/**
 * SyncAdapter - creates an adapter based on the
 * model interface and transactions
 * @param  exports [description]
 * @param  angular [description]
 * @return [description]
 */
;(function(exports, angular){
	function createAdapter(interface, methods, transactions){
		var adapter;
		adapter = {};

		for (var i = methods.length - 1; i >= 0; i--) {
			
			(function(){
				var method = methods[i];
				adapter[method.name] = function(data){
				// if the method is successfull
				// we record the transaction.
				if( method.func(data) ){
						transactions.add({name: method.name, data:data, time:Date.now()});
					}
				}	
			})()
		}
		adapter.transactions = transactions;
		adapter.parseCommands = function( commands ){
			for (var i = commands.length - 1; i >= 0; i--) {
				var cmd = commands[i];

				adapter[cmd.name](cmd.data);
			};
		}
		return adapter;
	}

	if(angular){
		angular.module('ng').service('SyncAdapter', function(){
			var self = this;
			self.createAdapter = createAdapter;
		})
	}

	if(exports){
		exports.createAdapter = createAdapter;
	}
})(exports, angular);