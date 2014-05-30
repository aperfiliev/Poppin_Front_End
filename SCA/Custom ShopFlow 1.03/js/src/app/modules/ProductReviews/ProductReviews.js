// ProductReviews.js
// -----------------
// Defines the ProductReviews module (Model, Collection, Views, Router)
// Mount to App also handles rendering of the reviews
// if the current view has any placeholder for them
define('ProductReviews'
,	['ProductReviews.Model', 'ProductReviews.Collection', 'ProductReviews.Views', 'ProductReviews.Router', 'ItemDetails.Model']
,	function (Model, Collection, Views, Router, ItemDetailsModel)
{
	'use strict';

	// TODO: the following functions are private
	// they should be somhow accessible so they can be overriden
	function fetchReviews ($container, model, collection, killerId)
	{
		var search = {}
		,	url = $container.data('url')
		,	itemid = $container.data('itemid');

		search[url ? 'url' : 'id'] = url || itemid;
		// [jQuery.when](http://api.jquery.com/jQuery.when/)
		return jQuery.when(
			// again, collection is the collection of reviews
			collection.fetch({
				data: {
					order: $container.data('order')
				,	itemid: itemid
				}
			})
			// item_details_model contains the data of the item
			// eg: average rating
		,	model.fetch({
				killerId: killerId
			,	data: search
			})
		);
	}

	function renderReviews ($container, options)
	{
		// we render the review and append it to the place holder
		var $item_details_reviews = jQuery(SC.macros.itemDetailsReviews(_.extend($container.data(), options)));

		var view = new Views.ItemReviewCenter(options);
		view.$el.append($item_details_reviews); 

		$container.append(view.$el);
	}

	function loadReviews ($containers, application)
	{
		return $containers.each(function ()
		{
			var $this = jQuery(this)
			,	collection = new Collection()
			,	model = new ItemDetailsModel();

			fetchReviews($this, model, collection, application.killerId)
				// http://api.jquery.com/deferred.done/
				.done(function ()
				{
					renderReviews($this, {
						application: application
					,	collection: collection
					,	item: model
					});
				}
			);
		});
	}

	return {
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection
	,	mountToApp: function (application)
		{
			Model.prototype.urlRoot = _.getAbsoluteUrl(Model.prototype.urlRoot);
			Collection.prototype.url = _.getAbsoluteUrl(Collection.prototype.url);

			application.getLayout().on('afterAppendView', function (view)
			{
				loadReviews(view.$('[data-type="review-list-placeholder"]:empty'), application);
			});
			
			// default behaviour for mount to app
			return new Router(application);
		}
	};
});
