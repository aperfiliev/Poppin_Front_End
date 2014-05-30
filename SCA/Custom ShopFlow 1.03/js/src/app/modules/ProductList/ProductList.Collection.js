// ProductList.Collection.js
// -----------------------
// Product List collection
define('ProductList.Collection', ['ProductList.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({

		url: _.getAbsoluteUrl('services/product-list.ss')

	,	model: Model

		// Returns an array of lists where the item is present
	,	getCheckedLists: function (product)
		{
			return this.filter(function (model)
			{
				return model.checked(product);
			}).map(function (productList)
			{
				return productList.get('name');
			});
		}

		// Filter based on the iterator and return a collection of the same type
	,	filtered: function(iterator) {
			return new this.constructor(this.filter(iterator));
		}
	});

});