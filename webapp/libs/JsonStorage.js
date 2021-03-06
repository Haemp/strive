var JsonStorage = angular.module('JsonStorage', ['fileSystem', 'AngularSugar']);

JsonStorage.service('JsonStorage', function( $q, $timeout, fileSystem, PromiseSerializer ){
	var self = this;

	self.isPackaged = (typeof chrome != 'undefined') ? (!!chrome.storage) : false;	
	
	self.fileSystem = {
		perferFs: false/* fileSystem.isSupported()*/,
		quota: 10 // in MB
	};

	self._init = function(){

		// prompt for permissino
		if( self.fileSystem.perferFs ){
			console.log('Filesystem supported');
			fileSystem.requestQuota(self.fileSystem.quota);
		}else{
			console.log('Filesystem not supported');
		}		
		
		// serialize execution of the following methods
		PromiseSerializer.decorate(this, ['save', 'get', 'remove']);
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

				console.log('chrome.storage.local Saving...', saveObj);
				chrome.storage.local.set(saveObj, function(){
					
					if( chrome.runtime.lastError )
						console.log('Local Storage Error: ', chrome.runtime.lastError);
					
					//console.log(JSON.stringify(saveObj));
					console.log('chrome.storage.local Data saved!', saveObj);
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
					else
						deferred.resolve();
				},function(err){
					console.log('Could not read'+key+'.json file', err);
				});				
		}else{

			// Local Storage
			if( self.isPackaged ){

				chrome.storage.local.get(key, function(value){
					
					if( chrome.runtime.lastError )
						console.log('Local Storage Error: ', chrome.runtime.lastError);
						
					console.log('Getting data...', value);
					console.log(JSON.stringify(value));
					deferred.resolve(value[key]);
				});
			
			}else{
				$timeout( function(){
					var stringObj = localStorage.getItem(key);
					if(stringObj && stringObj !== 'undefined' && stringObj !== '' ){ 
						deferred.resolve( JSON.parse(stringObj) );	 
					}else{
						deferred.resolve();	
					}
				}, 10);
			}
		}

		return deferred.promise; 
	}

	self.remove = function( key ){

		var deferred = $q.defer();

		if( self.isPackaged ){
			chrome.storage.local.remove(key, function(){
				
				if( chrome.runtime.lastError )
						console.log('Local Storage Error: ', chrome.runtime.lastError);
				
				console.log('Removing data', key);
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
				
				if( chrome.runtime.lastError )
						console.log('Local Storage Error: ', chrome.runtime.lastError);
				
				console.log('Clearing data');
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
