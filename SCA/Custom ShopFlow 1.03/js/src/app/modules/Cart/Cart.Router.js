// Cart.Router.js
// --------------
// Creates the cart route
define('Cart.Router', ['Cart.Views'], function (Views)
{
	'use strict';
	
	return Backbone.Router.extend({
		
		routes: {
			'cart': 'showCart'
		,	'cart?*options': 'showCart'
		}
		
	,	initialize: function (Application)
		{
			this.application = Application;
		}
		
	,	showCart: function ()
		{
			var view = new Views.Detailed({
				model: this.application.getCart()
			,	application: this.application
			});
			
			view.showContent();
		}
	});
});
