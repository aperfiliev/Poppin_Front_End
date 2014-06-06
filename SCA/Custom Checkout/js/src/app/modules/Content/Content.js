// Content.js
// ----------
// Integration to the Content Delivery Serivce Boundle
define(
	'Content'
,	['Content.DataModels', 'Content.EnhancedViews', 'Content.LandingPages']
,	function (DataModels, EnhancedViews, LandingPages)
{
	'use strict';
	
	return {
		DataModels: DataModels, 
		EnhancedViews: EnhancedViews, 
		LandingPages: LandingPages,
		mountToApp: function (Application)
		{
			// Wires the models to the assets root
			DataModels.Pages.Model.prototype.urlRoot = _.getAbsoluteUrl(DataModels.Pages.Model.prototype.urlRoot);
			DataModels.Urls.Model.prototype.urlRoot = _.getAbsoluteUrl(DataModels.Urls.Model.prototype.urlRoot);
			// Now we wire the collection
			DataModels.Pages.Collection.prototype.url = _.getAbsoluteUrl(DataModels.Pages.Collection.prototype.url);
			DataModels.Urls.Collection.prototype.url = _.getAbsoluteUrl(DataModels.Urls.Collection.prototype.url);

			DataModels.Application = Application;

			var Layout = Application.getLayout()
			,	show_content_wrapper = function (fn, view)
				{
					var promise = jQuery.Deferred();
					var args = arguments;

					// Check the url and loads the page definition if needed
					DataModels.loadPage('/' + Backbone.history.fragment, function (page)
					{
						// override the title and page header of the view with the page returned
						EnhancedViews.overrideViewSettings(view, page);

						// Calls the original function with all the parameters (slice to exclude fn)
						fn.apply(Layout, Array.prototype.slice.call(args, 1)).done(function ()
						{
							// once the original func is done this reads the attributes of the view and
							// sets title, metas and adds banners
							EnhancedViews.enhancePage(view, Layout);

							//only after enhancing the view we resolve the promise							
							promise.resolveWith(this, arguments);		
						});
					});

					return promise;
				};
			
			// Wraps the layout.showContent and Layout.showInModal methods
			// This make sure that every time you try to show content in the 
			// application the page will be enhaced by setting title, header, meta tags and banners 
			Layout.showContent = _.wrap(Layout.showContent, show_content_wrapper);
			Layout.showInModal = _.wrap(Layout.showInModal, show_content_wrapper);

			// Wraps the layout.updateUI function for rendering Content when importants part of the UI are updated dynamically. 
			Layout.updateUI = _.wrap(Layout.updateUI, function (fn)
			{
				fn.apply(Layout, []); 
				DataModels.loadPage('/' + Backbone.history.fragment, function (page)
				{
					var view = Layout; 
					EnhancedViews.overrideViewSettings(view, page);
					EnhancedViews.enhancePage(view, Layout);
				});
			});

			Layout.on('renderEnhancedPageContent', function (view, content_zone)
			{
				if (content_zone.contenttype === 'html')
				{
					EnhancedViews.renderHTMLContent(view, content_zone);
				}
			});

			Application.on('afterModulesLoaded', function ()
			{
				var query = '';

				_.each(DataModels.Urls.Collection.getInstance().landingPages, function (landing_page)
				{
					query = landing_page.get('query')[0] === '/' ? landing_page.get('query').substring(1) : landing_page.get('query');
					LandingPages.Router.prototype.routes[query + '?*options'] = 'displayLandingPage';
					LandingPages.Router.prototype.routes[query] = 'displayLandingPage';
				});

				return new LandingPages.Router(Application);
			});

			Application.on('afterStart', function ()
			{
				// Every time the url changes we call the DataModels.loadPage, 
				// so if we need to load content from the server, the request starts as soon as posible,
				// Probably while other ajax request are being made
				Backbone.history && Backbone.history.on('all', function ()
				{
					DataModels.loadPage('/' + Backbone.history.fragment);
				});

				// After the application Starts we will do the same, since the url have not changed yet
				Backbone.history && DataModels.loadPage('/' + Backbone.history.fragment);
			});
		}
	};
});
