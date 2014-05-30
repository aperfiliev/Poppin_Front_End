define('Home', function ()
{
	'use strict';
	
	var View = Backbone.View.extend({
		
		template: 'home'
		
	,	title: _('Welcome to the store').translate()
		
	,	page_header: _('Welcome to the store').translate()
		
	,	attributes: {
			'id': 'home-page'
		,	'class': 'home-page'
		}
		
	,	events: {}

	});
	
	var Router = Backbone.Router.extend({
		
		routes: {
			'': 'homePage'
		,	'?*params': 'homePage'
		}
		
	,	initialize: function (Application)
		{
			this.application = Application;
		}
		
	,	homePage: function () 
		{
			var view = new View({
				application: this.application
			});
			
			view.showContent();
		}
	});

	return {
		View: View
	,	Router: Router
	,	mountToApp: function (Application)
		{
			return new Router(Application);
		}
	};
});