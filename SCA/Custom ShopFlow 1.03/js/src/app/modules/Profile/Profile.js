// Profile.js
// ----------
// Stores all data related to the User
// Has methods to get and set the Recently Viewed Items
define('Profile', ['Facets.Model'], function (FacetsModel)
{
	'use strict';
	
	var Profile = {

		urlRoot: 'services/profile.ss'

	,	addHistoryItem: function(item)
		{
			if (item)
			{
				// If the item is already in the recently viewed, we remove it
				this.recentlyViewedItems.get('items').remove(item);
				
				// we add the item at the beginning of a collection
				this.recentlyViewedItems.get('items').unshift(item);

				if (this.useCookie)
				{
					var current_items = jQuery.cookie('recentlyViewedIds')
					,	news_items = _.union(this.recentlyViewedItems.get('items').pluck('internalid'), current_items);

					jQuery.cookie('recentlyViewedIds', _.first(news_items, this.numberOfItemsDisplayed));
				}
			}
		}

	,	loadItemsFromCookie: function ()
		{
			// create an array of ID items to get only the elements that are present in the cookie but are not present in memory
			var cookie_ids = jQuery.cookie('recentlyViewedIds') || [];
			
			cookie_ids = !_.isArray(cookie_ids) ? [cookie_ids] : cookie_ids;
			
			var	items_ids = _.difference(cookie_ids, this.recentlyViewedItems.get('items').pluck('internalid')).join(',')
			,	self = this;

			if (items_ids)
			{
				//return promise (http://api.jquery.com/promise/)
				return this.facetsModel.fetch({data:{id: items_ids}}, {silent: true}).done(function()
				{
					self.facetsModel.get('items').each(function (model)
					{
						// find the position of the item on the cookie
						var index = _(cookie_ids).indexOf(model.get('_id'));
						// add item to recentlyViewedItems at the position
						self.recentlyViewedItems.get('items').add(model, {at: index});
					});
				});
			}
			
			return jQuery.Deferred().resolve();
		}

	,	renderRecentlyViewedItems: function (view)
		{
			var self = this
			,	$container = view.$('[data-type="recently-viewed-placeholder"]')
			,	macro = SC.macros[$container.data('macro') || 'recentlyViewed'];

			return this.getRecentlyViewedItems().then(function ()
			{
				var items = self.recentlyViewedItems.get('items');
				
				items.remove(items.get(view.model.id));

				$container.html(macro(items.first(self.numberOfItemsDisplayed), view.options.application));
			});
		}
		
	,	getRecentlyViewedItems: function ()
		{
			return this.useCookie ? this.loadItemsFromCookie() : jQuery.Deferred().resolve();
		}
	};
		
	return {

		Profile: Profile

	,	mountToApp: function (application)
		{
			// Sets the getUser function for the application
			_.extend(application.getUser(), Profile, {
				application: application
				// we get this values from the configuration file
			,	useCookie: application.getConfig('recentlyViewedItems.useCookie', false)
				// initialize new instance of Facets Model to use search API
			,	facetsModel: new FacetsModel()
				// initialize the collection of items (empty)
			,	recentlyViewedItems: new FacetsModel().set('items',[])
			,	numberOfItemsDisplayed: application.getConfig('recentlyViewedItems.numberOfItemsDisplayed')
			});
			
			application.getLayout().on('afterAppendView', function (view)
			{
				if (view.$('[data-type="recently-viewed-placeholder"]').length)
				{
					application.getUser().renderRecentlyViewedItems(view);
				}
			});	
		}
	};
});