// Content.EnhancedViews.js
// ------------------------
// The Landing pages Module uses the Content.DataModels to connect to the servers,
// That's why there is only a view and a router here
define(
	'Content.LandingPages'
,	['Content.DataModels', 'Content.EnhancedViews']
,	function (DataModels, EnhancedViews)
{
	'use strict';

	// Categories is an optional dependency
	var Categories = false;
	try {
		Categories = require('Categories');
	}
	catch (e)
	{
		console.log('Couldn\'t load Categories. ' + e);
	}

	// View:
	// Tho most of the content is driven by the content service 
	// we need a view to extend upon
	var View = Backbone.View.extend({
		
		template: 'landing_page'
	,	title: ''
	,	page_header: ''
	,	attributes: {
			'id': 'landing-page'
		,	'class': 'landing-page'
		}
	,	events: {}
		
	,	initialize: function ()
		{
			this.url = Backbone.history && Backbone.history.fragment;
		}
		
		// View.showContent:
	,	showContent: function (page)
		{
			this.page_header = page.get('pageheader');
			this.page = page;
			this.options.layout.showContent(this);
		}
		
		// View.getBreadcrumb:
		// It will try to figure the breadcrumb out of the url
	,	getBreadcrumb: function ()
		{
			var breadcrumb = [{
					href: '/'
				,	text: _('Home').translate()
				}];
			
			if (this.url && Categories)
			{
				var category_path = '';
				_.each(Categories.getBranchLineFromPath(this.url), function (cat)
				{
					category_path += '/'+cat.id;
					
					breadcrumb.push({
						href: category_path
					,	text: cat.title
					});
				});
			}

			breadcrumb.push({
				href: this.url 
			,	text: this.page_header
			});

			return breadcrumb;
		}
	});
	
	// Router:
	var Router = Backbone.Router.extend({
		
		// Routes are created based on the urls in the content.mountToApp
		routes: {}
		
	,	initialize: function (Application)
		{
			this.Application = Application;
		}
		
		// Router.displayLandingPage
		// uses the DataModels.loadPage to load the data and create the model
	,	displayLandingPage: function (option) 
		{
			var self = this
			,	page_url = option ? Backbone.history.fragment.replace('?' + option, '') : Backbone.history.fragment
			,	view = new View({
					application: this.Application
				,	layout: this.Application.getLayout()
				});
			
			DataModels.loadPage('/' + page_url, function (page)
			{
				if (page)
				{
					EnhancedViews.overrideViewSettings(view, page);
					view.showContent(page);					
				}
				else
				{
					self.Application.getLayout().notFound();
				}
			});
		}
	});
	
	return {
		View: View
	,	Router: Router
	};
});