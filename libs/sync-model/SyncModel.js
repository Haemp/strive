angular.module('SyncModel', [])

/**
 *
 * @return {[type]} [description]
 */
.service('SyncModel', ['',
	function() {
		var self = this;

		/**
		 * Sets methods on an object to be recordable
		 */
		self.record = function(model, methods) {

			for (var i = methods.length - 1; i >= 0; i--) {
				var method = methods[i];

				// save the original func in private var
				model['_' + method] = model.[method];

				// add a wrapper to the original function
				model[method] = function(data) {

					// if the method is successfull
					// we record the transaction.
					model['_' + method](data, function(valid) {
						if (valid) {
							transactions.add({
								name: method.name,
								data: data,
								time: Date.now()
							});
						}
					})
				}
			}
		}
	}
]);