// ProductList.Views.js
// -----------------------
// Views for handling Product Lists (CRUD)
define('ProductListMenu.View', function ()
{
	'use strict';

	return Backbone.View.extend({
		
		template: 'product_list_menu'
		
	,	attributes: {'class': 'ProductListMenuView'}

	,	initialize: function(options)
		{
			this.options = options;
			this.application = options.application;
			this.is_single_list = this.application.ProductListModule.isSingleList(this.application); 
			if (this.is_single_list)
			{
				this.model = this.collection.at(0); 
			}
		}
	
	});

});
