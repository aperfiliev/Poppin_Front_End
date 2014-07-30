// Merhcandising Item Collection
// -----------------------------
// Item collection used for the merchandising zone
define('Merchandising.ItemCollection', ['ItemDetails.Collection'], function (ItemDetailsCollection)
{
	'use strict';

	// we declare a new version of the ItemDetailsCollection
	// to make sure the urlRoot doesn't get overridden
	return ItemDetailsCollection.extend({
		urlRoot: '/api/items'
	});
});