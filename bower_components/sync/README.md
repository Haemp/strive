Sync/Batcher for Angular
====
* This is very much an alpha library *

Service to batch up offline requests and sync them with a server when possible.

## Install ##
```
bower install Haemp/sync
```

## Configure ##
flushInterval - how often we try to sync

```javascript
angular.module('App').run(function(Sync, SyncOptions){

   // set options
   SyncOptions = {
      flushInterval: 9001
   }

   // start the automatic sync loop
   // this one syncs ever 9 seconds
   Sync.syncAuto();

   // OR do
   // to not have to set the options 
   // separatly
   Sync.syncAuto(9001);
});
```

## Batching requests ##

```javascript
Sync.batch({method:'GET', url: '/some/api', withCredentials:true});
```
[ ] Add httpInterceptor to batch all call automatically

## Syncing requests ##
If you initiated the manuall loop the sync will handle itself. If you want to
trigger it automatically:

```javascript
Sync.syncManual();
```

## Downsync (optional) ##
A normal sync process goes like this
	1. User acts and generates a list of batched requests to be synced
	2. Sync is triggered and the transactions merged into the server data
	3. Client data is updated from the newly merged server data (downsync)
The downsync is basically a poll of fresh server data that happens AFTER a sync operation is complete.
```javascript
	SyncOptions.downsync = { 
		method: 'GET', 
		url: '/api/new/freshly/baked/data',
		withCredentials:true
	}
```
This request will be triggered after a full sync is successful. If the downsync process is interupted by another request by the user, it is cancelled and a new Sync process is started. This is to make sure the data you get back from the downsync is the latest merged server data.

## Develop ##
```
git clone https://github.com/Haemp/sync
cd /sync
npm install
bower install

// testing
grunt test
```
