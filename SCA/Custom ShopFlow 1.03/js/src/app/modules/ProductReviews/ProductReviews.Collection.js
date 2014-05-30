// ProductReviews.Collection.js
// ----------------------------
// Returns an extended version of the CachedCollection constructor
// (file: Backbone.cachedSync.js)
define('ProductReviews.Collection', ['ProductReviews.Model'], function (Model)
{
	'use strict';
	
	return Backbone.CachedCollection.extend({
		
		url: 'services/product-reviews.ss'
		
	,	model: Model
		
		// pre-processes the data after fetching
		// http://backbonejs.org/#Model-parse
	,	parse: function (data)
		{
			// We set up some global attributes to the Collection
			this.page = data.page;
			this.recordsPerPage = data.recordsPerPage;
			this.totalRecordsFound = data.totalRecordsFound;
			this.totalPages = Math.ceil(this.totalRecordsFound / this.recordsPerPage);
			
			// and we return only the collection from the server
			return data.records;
		}
	});
});