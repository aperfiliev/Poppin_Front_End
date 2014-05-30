// ProductReviews.Router.js
// ------------------------
// Handles the rendering of the different views depending on the URL route
define('ProductReviews.Router'
,	['ProductReviews.Model', 'ProductReviews.Collection', 'ProductReviews.Views', 'ItemDetails.Model']
,	function (Model, Collection, Views, ItemDetailsModel)
{
	'use strict';
	
	// http://backbonejs.org/#Router
	return Backbone.Router.extend({

		routes: { 
			':url/reviews': 'reviewsListByUrl'
		,	':url/reviews?:options': 'reviewsListByUrl'
		,	':url/reviews/new': 'createReviewByUrl'
		
		,	'product/:id/reviews': 'reviewsListById'
		,	'product/:id/reviews?:options': 'reviewsListById'
		,	'product/:id/reviews/new': 'createReviewById'
		}
		
	,	initialize: function (Application)
		{
			this.application = Application;
		}
		
	,	reviewsListByUrl: function (url,options)
		{
		
			if (~url.indexOf('?'))
			{
				url = url.split('?')[0];
			}
			
			// Now go grab the data and show it
			this.reviewsList({url: url}, url, SC.Utils.parseUrlOptions(options));
		}
		
	,	reviewsListById: function (id, options)
		{
			this.reviewsList({id: id}, 'product/'+id, SC.Utils.parseUrlOptions(options));
		}
		
		// reviewsList:
		// lists the reviews for a specific item
	,	reviewsList: function (api_params, base_url, options)
		{
			var collection = new Collection()
			
			,	item_details_model = new ItemDetailsModel()
			
			,	application = this.application
				// we create a new instance of the ItemReviewCenter view
				// passing the required options
			,	view = new Views.ItemReviewCenter({
					collection: collection
				,	queryOptions: options
				,	baseUrl: '/' + base_url + '/reviews'
				,	item: item_details_model
				,	application: this.application
				})

			,	sort
			,	filter
				// Cumputes Params for Reviews API
			,	reviews_params = {};

			// if there's a filter in the URL
			if (options.filter)
			{
				// we get it from the config file, based on its id
				filter = _.find(this.application.getConfig('productReviews.filterOptions'), function (i) {
					return i.id === options.filter;
				}) || {};
			}
			else
			{
				// otherwise we just get the default one
				filter = _.find(this.application.getConfig('productReviews.filterOptions'), function (i) {
					return i.isDefault;
				}) || {};
			}
			// and we add it to the reviews_params obj
			reviews_params = _.extend(reviews_params, filter.params);
			
			// same for sorting, if it comes as a parameter
			if (options.sort)
			{
				// we get it from the config file
				sort = _.find(this.application.getConfig('productReviews.sortOptions'), function (i) {
					return i.id === options.sort;
				}) || {};
			}
			else
			{
				// otherwise we just get the default one
				sort = _.find(this.application.getConfig('productReviews.sortOptions'), function (i) {
					return i.isDefault;
				}) || {};
			}
			// and we add it to the reviews_params obj
			reviews_params = _.extend(reviews_params, sort.params);
			
			// If there's a specific page in the url, we pass that to
			// if there isn't, we just get the first oen
			reviews_params = _.extend(reviews_params, {page: options.page || 1});

			// we fetch the data from the item
			item_details_model.fetch({ 
				data: api_params
			,	killerId: application.killerId
			,	success: function ()
				{
					// then fetch all of the reviews, with the filters, order and pages
					reviews_params.itemid = item_details_model.get('internalid');
					// that were seted up earlier
					collection.fetch({ 
						data: reviews_params
					,	killerId: application.killerId
					,	success: function ()
						{
							// after both collection and model have been fetched
							// we show the content of the view
							view.showContent();
						}
					});
				}
			});
		}
		
	,	createReviewByUrl: function (url)
		{
			// if there are any options in the URL
			if (~url.indexOf('?'))
			{
				url = url.split('?')[0];
			}
			
			// Now go grab the data and show it
			this.createReview({url: url});
		}
		
	,	createReviewById: function (id)
		{
			this.createReview({id: id});
		}
		
		// createReview:
		// renders the Product Reviews form
	,	createReview: function (api_params)
		{
			var item_details_model = new ItemDetailsModel()

			,	model = new Model()
				// creates a new instance of the Form View
			,	view = new Views.Form({
					item: item_details_model
				,	model: model
				,	application: this.application
				});
			
			// then we fetch for the data of the item
			item_details_model.fetch({
				data: api_params
			,	killerId: this.application.killerId
				// and we show the content on success
			,	success: function ()
				{
					view.showContent();
				}
			});
		}
	});
});