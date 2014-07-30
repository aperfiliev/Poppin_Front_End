// Merchandising.jQueryPlugin
// --------------------------
// Creates a jQuery plugin to handle the Merchandising Zone's intialization
// ex: jQuery('my-custom-selector').merchandisingZone(options)
// options MUST include the application its running
// id of the Zone to be rendered is optional IF it is on the element's data-id
define('Merchandising.jQueryPlugin', ['Merchandising.Zone'], function (MerchandisingZone)
{
	'use strict';
	// [jQuery.fn](http://learn.jquery.com/plugins/basic-plugin-creation/)
	jQuery.fn.merchandisingZone = function (options)
	{
		return this.each(function ()
		{
			new MerchandisingZone(this, options);	
		});
	};
});