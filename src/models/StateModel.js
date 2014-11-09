(function() {
	angular.module('Strive')

	.service('StateModel', function(HabitModel, MonitorModel, RecipeModel, TransactionModel, $q) {
		var self = this;
		self.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
		self.userAgent = navigator.userAgent;
		self.isAndroidBrowser = ((navigator.userAgent.indexOf('Mozilla/5.0') > -1 && navigator.userAgent.indexOf('Android ') > -1 && navigator.userAgent.indexOf('AppleWebKit') > -1) && !(navigator.userAgent.indexOf('Chrome') > -1));

		self.states = [];
		console.log('Is it chrome: ', self.isChrome);

		self.whenLoaded = function() {
			return $q.all([
				HabitModel.isInitiated(),
				MonitorModel.isInitiated(),
				RecipeModel.isInitiated(),
				TransactionModel.isInitiated()
			]);
		}
	});

})()
