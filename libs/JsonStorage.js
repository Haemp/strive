var JsonStorage = angular.module('JsonStorage', ['fileSystem']);

JsonStorage.service('JsonStorage', function( $q, $timeout, fileSystem ){
	var self = this;

	self.isPackaged = (!!chrome.storage);
	
	self.fileSystem = {
		perferFs: fileSystem.isSupported(),
		quota: 10 // in MB
	};

	self._init = function(){


		// prompt for permissino
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
					else
						deferred.resolve();
				},function(err){
					console.log('Could not read'+key+'.json file', err);
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
