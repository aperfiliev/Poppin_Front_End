// ProductListItem.Collection.js
// -----------------------
// Product List collection
define('ProductListItem.Collection', ['ProductListItem.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({
		
		url: _.getAbsoluteUrl('services/product-list-item.ss')

	,	initialize: function(options) 
		{
			this.options = options; 
		}	

	,	model: Model
	
	});
});