// OrderHistory.Router.js
// -----------------------
// Router for handling orders
define('OrderHistory.Router',  ['OrderHistory.Views', 'PlacedOrder.Model','PlacedOrder.Collection'], function (Views, Model, Collection)
{

	'use strict';

	return Backbone.Router.extend({

		routes: {
			'ordershistory': 'ordersHistory'
		,	'ordershistory?:options': 'ordersHistory'
		,	'ordershistory/view/:id': 'orderDetails'
		}
		
	,	initialize: function (application)
		{
			this.application = application;
		}
		
	// list orders
	,	ordersHistory: function (options) 
		{
			options = (options) ? SC.Utils.parseUrlOptions(options) : {page: 1};
			
			options.page = options.page || 1;
			
			var collection = new Collection()
			,	view = new Views.List({
					application: this.application
				,	page: options.page
				,	collection: collection
				});

			collection
				.on('reset', view.showContent, view)
				.fetch({
					killerId: this.application.killerId
				,	data: options
				,	reset: true
				});
		}
		
	// view order's detail
	,	orderDetails: function (id)
		{
			var model = new Model({internalid: id})
			,	view = new Views.Details({
					application: this.application
				,	id: id
				,	model: model
				});

			model
				.on('change', view.showContent, view)
				.fetch();
		}
	});
});