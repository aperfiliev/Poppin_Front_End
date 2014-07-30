/*!
* Description: SuiteCommerce Reference Checkout
*
* @copyright (c) 2000-2013, NetSuite Inc.
* @version 1.0
*/

// Application.js
// --------------
// Extends the application with Checkout specific core methods

(function ( Checkout )
{
	'use strict';

	// Extends the layout of Checkout
	Checkout.Layout = Checkout.Layout.extend({
	
		// Register the global key Elements, in this case the sidebar and the breadcrum
		key_elements: {
			breadcrumb: '#breadcrumb'
		}
	});
	
	// Wraps the SC.Utils.resizeImage and passes in the settings it needs
	// TODO: EXTEND THIS AS A EXTRA 
	_.extend(Checkout, {
		resizeImage: function (url, size)
		{
			var mapped_size = Checkout.getConfig('imageSizeMapping.'+ size, size);
			return SC.Utils.resizeImage(Checkout.getConfig('siteSettings.imagesizes', []), url, mapped_size);
		}
	});
	
	Checkout.start = _.wrap(Checkout.start, function(fn)
	{
		var wizard_modules = _(this.getConfig('checkoutSteps')).chain().pluck('steps').flatten().pluck('modules').flatten().value();
		
		wizard_modules = _.uniq(wizard_modules);
		
		this.Configuration.modules = _.union(this.getConfig('modules'), wizard_modules);
		
		fn.apply(this, _.toArray(arguments).slice(1));
	});
	
	// This makes that Promo codes and GC travel to different servers (secure and unsecure)
	Checkout.on('afterStart', function()
	{
		// Eximines the event target to check if its a touchpoint
		// and replaces it with the new version ot the touchpoint
		function fixCrossDomainNavigation(e)
		{
			var $element = jQuery(e.target);
			if (!$element.closest('#main').length)
			{
				var href = e.target.href
				,	touchpoints = Checkout.getConfig('siteSettings.touchpoints');
				_.each(touchpoints, function(touchpoint)
				{
					if (~touchpoint.indexOf(href.split('?')[0]))
					{
						e.target.href = touchpoint;
					}
				});
			}
		}
		// As this fixCrossDomainNavigation only alters the href of the a we can append it 
		// to the mouse down event, and not to the click thing will make us work a lot more :)
		jQuery(document.body).on('mousedown', 'a', fixCrossDomainNavigation);
		jQuery(document.body).on('touchstart', 'a', fixCrossDomainNavigation);
	});

	// Setup global cache for this application
	jQuery.ajaxSetup({cache:false});
	
})( SC.Application('Checkout') );