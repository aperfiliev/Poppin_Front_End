/*!
* Description: SuiteCommerce Reference ShopFlow
*
* @copyright (c) 2000-2013, NetSuite Inc.
* @version 1.0
*/

// Application.js
// --------------
// Extends the application with Shopping specific core methods

/*global _:true, SC:true, jQuery:true, Backbone:true*/

(function (Shopping)
{
	'use strict';
	
	// Get the layout from the application
	var Layout = Shopping.getLayout();
	
	// This will change the url when a "select" DOM element
	// of the type "navigator" is changed
	_.extend(Layout, {
		
		changeUrl: function (e) 
		{
			// Get the value of the select and navigate to it
			// http://backbonejs.org/#1Router-navigate
			Backbone.history.navigate(this.$(e.target).val(), {trigger: true});
		}
	});
	
	_.extend(Layout.events, {
		'change select[data-type="navigator"]' : 'changeUrl'
	});

	// Wraps the SC.Utils.resizeImage and passes in the settings it needs
	_.extend(Shopping, {

		resizeImage: function (url, size)
		{
			var mapped_size = Shopping.getConfig('imageSizeMapping.' + size, size);
			return SC.Utils.resizeImage(Shopping.getConfig('siteSettings.imagesizes', []), url, mapped_size);
		}
	});

	// Setup global cache for this application
	jQuery.ajaxSetup({cache:true});

	//TODO: relocate this line (in Shopping and MyAccount)
	//It triggers main nav collapse when any navigation occurs
	Backbone.history.on('all', function()
	{
		jQuery('.main-nav.in').collapse('hide');
	});

})(SC.Application('Shopping'));