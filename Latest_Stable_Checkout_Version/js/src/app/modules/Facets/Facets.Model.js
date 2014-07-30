// Facets.Model.js
// ---------------
// Connects to the search api to get all the items and the facets
// A Model Contains a Collection of items and the list of facet groups with its values
define('Facets.Model', ['ItemDetails.Collection'], function (ItemDetailsCollection)
{
	'use strict';
	
	var original_fetch = Backbone.CachedModel.prototype.fetch;

	return Backbone.CachedModel.extend({
		
		urlRoot: '/api/items'

	,	initialize: function ()
		{
			// Listen to the change event of the items and converts it to an ItemDetailsCollection
			this.on('change:items', function (model, items)
			{
				if (!(items instanceof ItemDetailsCollection))
				{
					// NOTE: Compact is used to filter null values from response
					model.set('items', new ItemDetailsCollection(_.compact(items)));
				}
			});
		}

		// model.fetch
		// -----------
		// We need to make sure that the cache is set to true, so we wrap it
	,	fetch: function(options)
		{
			options = options || {};

			options.cache = true;

			return original_fetch.apply(this, arguments);
		}

	}, {
		mountToApp: function (application) 
		{
			// sets default options for the search api
			this.prototype.urlRoot = SC.Utils.addParamsToUrl(this.prototype.urlRoot, application.getConfig('searchApiMasterOptions.Facets'));
		}
	});
});