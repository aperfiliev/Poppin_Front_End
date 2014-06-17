define('ShopByColor', function ()
{
	'use strict';
	
	var View = Backbone.View.extend({
		
		template: 'shop_by_color'
		
	,	title: _('Shop by Color | Colorful Office Supplies | Poppin').translate()
		
	,	page_header: _('Shop by Color').translate()
		
	,	attributes: {
			'id': 'shop-by-color'
		,	'class': 'shop-by-color'
		}
		
	,	events: {}

	});
	
	var Router = Backbone.Router.extend({
		
		routes: {
			'Shop-By-Color': 'ShopByColor'
		,	'Shop-By-Color?*params': 'ShopByColor'
		}
		
	,	initialize: function (Application)
		{
			this.application = Application;
		}
		
	,	ShopByColor: function (params)
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