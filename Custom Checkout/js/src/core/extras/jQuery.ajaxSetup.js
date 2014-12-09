// jQuery.ajaxSetup.js
// -------------------
// Adds the loading icon, updates icon's placement on mousemove
// Changes jQuery's ajax setup defaults
(function ()
{
	'use strict';

	// Variable used to track the mouse position
	var mouse_position = {
		top: 0
	,	left: 0
	};
	
	jQuery(document).ready(function ()
	{
		var $body = jQuery(document.body)
		,	$loading_icon = jQuery('#loadingIndicator');

		if (!$loading_icon.length)
		{
			// if the icon wasn't there, lets add it and make a reference in the global scope
			$loading_icon = SC.$loadingIndicator = jQuery('<img/>', {
				id: 'loadingIndicator'
			,	'class': 'global-loading-indicator'
			,	src: _.getAbsoluteUrl('//poppin.imgix.net/images/checkout/ajax-loader.gif')
			,	css: {
					zIndex: 9999
				,	position: 'absolute'
				}
			}).hide().appendTo($body);
		}

		// loading icon sizes, used for positioning math
		var icon_height = 16
		,	icon_width = 16;

		$body.on({
			// On mouse move, we update the icon's position, even if its not shown
			mousemove: function (e)
			{
				// TODO: if we use a setTimeOut we would improve the performance of this
				mouse_position = {
					top: Math.min($body.innerHeight() - icon_height, e.pageY + icon_width)
				,	left: Math.min($body.innerWidth() - icon_width, e.pageX + icon_height)
				};

				$loading_icon.filter(':visible').css(mouse_position);
			}
			// when the body resizes, we move the icon to the bottom of the page
			// so we don't get some empty white space at the end of the body
		,	resize: function ()
			{
				var icon_offset = $loading_icon.offset();

				mouse_position = {
					top: Math.min($body.innerHeight() - icon_height, icon_offset.top)
				,	left: Math.min($body.innerWidth() - icon_width, icon_offset.left)
				};

				$loading_icon.filter(':visible').css(mouse_position);
			}
		});
	});
	
	SC.loadingIndicatorShow = function ()
	{
		SC.$loadingIndicator && SC.$loadingIndicator.css(mouse_position).show();
	};
	
	SC.loadingIndicatorHide = function ()
	{
		SC.$loadingIndicator && SC.$loadingIndicator.hide();
	};
	
	// This registers an event listener to any ajax call
	jQuery(document)
		// http://api.jquery.com/ajaxStart/
		.ajaxStart(SC.loadingIndicatorShow)
		// http://api.jquery.com/ajaxStop/
		.ajaxStop(SC.loadingIndicatorHide);
	
	// http://api.jquery.com/jQuery.ajaxSetup/
	jQuery.ajaxSetup({
		beforeSend: function (jqXhr, options)
		{
			// BTW: "!~" means "== -1"
			if (!~options.contentType.indexOf('charset'))
			{
				// If there's no charset, we set it to UTF-8
				jqXhr.setRequestHeader('Content-Type', options.contentType + '; charset=UTF-8');
			}
		}
	});
})();