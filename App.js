var Ardor = angular.module('Ardor', ['ui.router', 'ClickHide', 'ngAnimate', 'fileSystem']);

Ardor.config(function($stateProvider, $urlRouterProvider) {
  
	$stateProvider.state('index', {
		url: "",
		views: {
			'main': {
				templateUrl: "views/customer-list.html",
				controller: 'QueueListCtrl'
			},
			'sidebar': {
				templateUrl: "views/customer-details.html",
				controller: 'CustomerDetailsCtrl'
			}
		}
	});
  
});

Ardor.controller('ArdorCtrl', function( $scope, CustomerModel, ActiveCustomerModel, $state, StorageAdapter, StateModel, NotificationModel ){

	$scope.Window = {};
	$scope.Window.bigScreen = true;
	
	$scope.ActiveCustomerModel = ActiveCustomerModel;
	$scope.StateModel = StateModel;
	$scope.StorageAdapter = StorageAdapter;



	$scope._init = function(){

		window.addEventListener('load', function() {
		    FastClick.attach(document.body);
		}, false);
		
		CustomerModel.loadCustomers();

		$state.transitionTo('index');
		
		$scope.$on('SlideIn.RIGHT_SLIDE_IN', function(){
			$scope.$apply(function(){
				$scope.StateModel.basementOpen = true;	
			});
		});

		if( chrome.notifications ){

			// listen for user click on ntofication
			chrome.notifications.onClicked.addListener(function( notificationId ){

				var notification = NotificationModel.map[notificationId];
				if( notification.type == "RETURN" ){

					console.log('You\'re here from a notification aren\'t you?');

					// set it as the quick action model to trigger the popup
					$scope.$apply(function(){
						StateModel.quickActionModel = notification.customer;	
					});
				}
			});
		}
	}

	$scope.createCustomer = function( customer ){
		CustomerModel.createCustomer( customer );

		// clear the inputs
		CustomerModel.newCustomer = undefined;
	}



	$scope._init();	
});

Ardor.controller('QueueListCtrl', function( $scope, ActiveCustomerModel, CustomerModel, $timeout ){

	$scope.CustomerModel = CustomerModel;
	$scope._init = function(){

		// when a customer is added we trigger the wait timeout
		// calcs
		$scope.$watch('CustomerModel.customers.length', self.onChangeCustomers);
		
		self.updateTick();
		self.setTimeWaited();
	}

	self.onChangeCustomers = function( newValue ){
		if( newValue )
			self.setTimeWaited();
	}

	$scope.selectCustomer = function( customer ){

		ActiveCustomerModel.activeCustomer = customer;
	}
	
	self.setTimeWaited = function(){
		for (var i = CustomerModel.customers.length - 1; i >= 0; i--) {
			var waitLeft = Math.round(
				CustomerModel.customers[i].wait - (new Date().getTime() - CustomerModel.customers[i].createdAt) / (1000*60)
			);
				
			CustomerModel.customers[i].waitLeft = (waitLeft >= 0) ? waitLeft : 0;
		}
	}

	self.updateTick = function(){
		$timeout(function(){
			self.setTimeWaited();
			
			self.updateTick();
		}, 60000);
	}

	$scope._init();	
});

Ardor.controller('CustomerDetailsCtrl', function( $scope, ActiveCustomerModel, CustomerModel, $state, $timeout ){

	$scope.ActiveCustomerModel = ActiveCustomerModel;
	$scope.CustomerModel = CustomerModel;
	
	$scope._init = function(){
		
	}
	
	$scope.remove = function( customer ){
		
		customer.status = 'left';
		
		// need to wrap this in a timeout to 
		// make sure the ng-class is triggered before
		// the animation. 
		$timeout(function(){
			CustomerModel.customerLeft( customer );
			ActiveCustomerModel.activeCustomer = undefined;
		},1);
	}

	$scope.seat = function( customer ){
		customer.status = 'seated';

		// see $scope.
		$timeout(function(){
			CustomerModel.customerSeated( customer );
			ActiveCustomerModel.activeCustomer = undefined;	
		}, 1);	
	}
	$scope.return = function( customer ){
		customer.status = 'return';
	}

	$scope._init();	
});


/**
 * Handles slide from the left to trigger the basement. We base it on the dragRight
 * Hammerjs event and if the user has dragged far enough right we trigger the basement
 */
Ardor.directive('basement', function( $document ){
	if( Hammer == 'object' ) throw new Error('Needs moar Hammerjs! http://eightmedia.github.io/hammer.js/');

	return{
		restrict: 'E',
		scope: {
			open: '=?'
		},
		replace: true,
		transclude: true,
		template: 	'<div class="Basement" click-hide ch-activate="open == true" ch-click="open = false" click ng-transclude ng-class="{\'Basement_open\': open}">'+
			 	  		
					'</div>',
		link: function( $scope, element, attr ){

			var self = this;
			self.boundSize = 100;
			self._init = function(){
				
				// listen for a global slide in from the left
				Hammer($document[0]).on('dragright', self.onDragRight);

				Hammer(element[0]).on('dragleft', self.onDragLeft);
			}
		
			/**
			 * Open sesame
			 */
			self.onDragRight = function(e){
				
				// is the start coord within the left most bound?
				var gesture = e.gesture
				if( gesture.startEvent.center.pageX < self.boundSize ){
					
					$scope.$apply(function(){
						$scope.open = true;
					});
					
				}
			}

			self.onDragLeft = function(){
				$scope.$apply(function(){
					$scope.open = false;
				});
			}

			self._init();
		}
	}
});

Ardor.animation('.Anim-customer-added', function( $timeout ) {
  return {
    enter: function(element, done) {
      
      	element = $(element[0]);
		
		  
		  var topDistance = element.offset().top;
		  
		  console.log(topDistance);
		  
		  element.css('-webkit-transform', 'translateY(-'+(topDistance+150)+'px)');
		  $timeout(function(){
			element.css('transition', '0.5s');
		  	element.css('-webkit-transform', 'translateY(0px)');
		  	
			done();
			$timeout(function(){
				element.css('transition', '');
				element.css('-webkit-transform', '');	
			},1000);
			
		  }, 1);

		console.log('Enter')
      	done();
    },
   
  };
});

Ardor.service('StorageAdapter', function( $q, $timeout, fileSystem ){
	var self = this;

	self.isPackaged = (!!chrome.storage);
	
	self.fileSystem = {
		perferFs: fileSystem.isSupported(),
		quota: 10 // in MB
	};

	self._init = function(){

		console.log('Filesystem used:', self.fileSystem);

		if( self.fileSystem.perferFs )
			fileSystem.requestQuota(self.fileSystem.quota);
	}

	self.save = function( key, value ){
		
		var deferred = $q.defer();			

		// clean data
		var value = angular.copy(value);

		// can't use anonymous object
		var saveObj = {};
		saveObj[key] = value;

		if( self.fileSystem.perferFs ){	
			
			fileSystem.writeText(key+'.json', JSON.stringify(value));
		}else{
			if( self.isPackaged ){

				chrome.storage.local.set(saveObj, function( data ){
					console.log('Saving customer...', data);
					deferred.resolve();
				});
		
			}else{
				localStorage.setItem(key, JSON.stringify(value));
				$timeout( function(){
					deferred.resolve();
				}, 10);
			}
		}
		return deferred.promise;
	}

	self.get = function( key ){
		
		var deferred = $q.defer();

		if( self.fileSystem.perferFs ){

			// File system
			fileSystem.readFile(key+'.json')
				.then(function(contents){
					if( contents )
					deferred.resolve(JSON.parse(contents));
				},function(){
					console.log('Could not read'+key+'.json file');
				});				
		}else{

			// Local Storage
			if( self.isPackaged ){

				chrome.storage.local.get(key, function(value){
					console.log('Getting customers...', value);
					deferred.resolve(value[key]);
				});
			
			}else{
				$timeout( function(){
					deferred.resolve( JSON.parse(localStorage.getItem(key)) );	
				}, 10);
			}
		}

		return deferred.promise; 
	}

	self.remove = function( key ){

		var deferred = $q.defer();

		if( self.isPackaged ){
			chrome.storage.local.remove(key, function(){
				deferred.resolve();
			});
		}else{
			localStorage.removeItem(key)
			$timeout( function(){
				deferred.resolve();	
			}, 10);
		}

		return deferred.promise;
	}

	self.clear = function(){

		var deferred = $q.defer();

		if( self.isPackaged ){
			chrome.storage.local.clear(function(){
				deferred.resolve();
			});
		}else{
			$timeout( function(){
				localStorage.clear();
			}, 10);
		}

		return deferred.promise;
	}

	self._init();
})

