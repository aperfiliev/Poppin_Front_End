// Backbone.cachedSync.js
// ----------------------
// This module defines a new type of Module and Collection and an alternative 
// to Backbone.sync that adds a cacheing layer to all read requests, but 
// leaves all write actions unmodified
(function(){
	
	'use strict';
	
	// The cache is an object where keys are a request identifier and values are a the result of the request and some metadata 
	Backbone.localCache = {};
	// We will cap the size of the cache by an arbitratry number, fell free to change it to meet your needs.
	Backbone.cacheSize = 100;
	
	// Removes the oldest requests once the limit is reached
	function evictRecords()
	{
		var keys = _.keys(Backbone.localCache)
		,	cache_size = keys.length;
		if (cache_size > Backbone.cacheSize)
		{
			delete Backbone.localCache[keys[0]];
		}
	}
	
	// Backbone.cachedSync:
	// Can be used interchangeably with Backbone.sync, it will retun a jQuery promise
	// once it's done will call the apropiate function 
	Backbone.cachedSync = function (action, self, options)
	{
		if (action === 'read')
		{
			// Generates an uninque url that will be used as the request identifier
			var url = _.result(this, 'url');
			if (options && options.data)
			{
				url += ((~url.indexOf('?')) ? '&' : '?') + jQuery.param(options.data);
			}

			// Generates a new deferred for every new sync, no matter if its or not in the cache
			// This is the responce of this method, this promice will be resolved by the ajax request
			var deferred = jQuery.Deferred();

			// jQuery.ajax maps error to fail and success to done
			deferred.error = deferred.fail;
			deferred.success = deferred.done;

			// Now we make sure the success and error options are called
			deferred.success(options.success);
			deferred.error(options.error);

			// We then delete them from the options that will be passed to the real call so they are not called twice, for the 1st request
			delete options.success;
			delete options.error;

			// Now we get the actual request from the cache or we perform it
			Backbone.localCache[url] = Backbone.localCache[url] || Backbone.sync.apply(this, arguments);

			// Now we resolve the Deferred by listeinig to the resolution of the real request
			// if the request was already resolved our methods will be called imediatelly
			Backbone.localCache[url].then(
				// Success Callback 
				function (response, status, jqXhr) {
					// Sometimes parse modifies the responce object (that is passed by reference)
					response = (jqXhr.responseText) ? JSON.parse(jqXhr.responseText) : response;
					// now we resolve the defered one with results 
					deferred.resolveWith(Backbone.localCache[url], [response, status, jqXhr]);
					// This make sure the cache is keept short
					evictRecords();
				}
				// Error Callback 
			,	function () {
					// if it fails we make sure the next time its requested, dont read from cache
					delete Backbone.localCache[url];
					deferred.rejectWith(Backbone.localCache[url], arguments);
				}
				// Progess Callback
			,	function() {
					deferred.notifyWith(Backbone.localCache[url], arguments);
				}
			);

			// Then we just return the defered
			return deferred;
			// Bottom line: we are piping a fake ajax deferred from the original one
		}

		// if cache is not present we just call the original Backbone.sync
		return  Backbone.sync.apply(this, arguments);
	};
	
	
	function addToCache (data, params)
	{
		/*jshint validthis:true*/
		// Generates an uninque url that will be used as the request identifier
		var url = _.result(this, 'url');
		url += ((~url.indexOf('?')) ? '&' : '?') + jQuery.param(params || {});

		// This defered will be used as a fake Ajax Request we are gonna store in the cache
		var deferred =  jQuery.Deferred();

		// We resolve the defered with the data you sent and some fake ajax info
		deferred.resolveWith(this, [
			data
		,	'success'
		,	{
				response: data
			,	status: 'success'
			,	statusCode: '200'
			,	readyState: 4
			,	statusText: 'OK'
			,	responseText: false // So it will use response instead of responseText
			}
		]);

		// Stores this fake promice in the cache
		Backbone.localCache[url] = deferred;
	}
	
	// Backbone.CachedCollection: 
	// It's just an extention of the original Backbone.Collection but it uses the Backbone.cachedSync
	Backbone.CachedCollection = Backbone.Collection.extend({
		sync: Backbone.cachedSync
	,	addToCache: addToCache
	});
	
	// Backbone.CachedModel: 
	// It's just an extention of the original Backbone.Model but it uses the Backbone.cachedSync
	Backbone.CachedModel = Backbone.Model.extend({
		sync: Backbone.cachedSync
	,	addToCache: addToCache
	});
	
})();