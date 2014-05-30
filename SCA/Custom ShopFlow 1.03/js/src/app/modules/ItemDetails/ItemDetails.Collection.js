// ItemDetails.Collection.js
// -------------------------
// Returns an extended version of the CachedCollection constructor
// (file: Backbone.cachedSync.js)
define('ItemDetails.Collection', ['ItemDetails.Model'], function (Model)
{
	'use strict';

	return Backbone.CachedCollection.extend({
		
		url: '/api/items'
	,	model: Model
		
		// http://backbonejs.org/#Model-parse
	,	parse: function (response)
		{
			// NOTE: Compact is used to filter null values from response
			return _.compact(response.items) || null;
		}
	});
});