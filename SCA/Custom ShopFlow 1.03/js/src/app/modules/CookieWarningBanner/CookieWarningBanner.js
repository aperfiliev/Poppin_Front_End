// CookieWarningBanner.js
// ----------------------
// Handles the display of the banner to be displayed
// warning the customers about the site's use of cookies

define('CookieWarningBanner', function ()
{
	'use strict';

	return {
		mountToApp: function (application)
		{
			var cookie_message = ''
			,	$cookie_message_element = ''
			,	Layout = application.getLayout()
			,	cookie_warning_settings = application.getConfig('cookieWarningBanner')
				// The cookie policy is set up in the backend
			,	cookie_warning_policy = application.getConfig('siteSettings.cookiepolicy')
			,	show_cookie_warning_banner = application.getConfig('siteSettings.showcookieconsentbanner') === 'T';

			jQuery.cookie.json = true;

			// If we need to show the banner and it hasn't been closed
			if (show_cookie_warning_banner && !(cookie_warning_settings.saveInCookie && jQuery.cookie('isCookieWarningClosed')))
			{
				cookie_message = cookie_warning_settings.message;
				// if there's a file
				if (cookie_warning_policy)
				{
					cookie_message += ' <a href="https://system.netsuite.com' + cookie_warning_policy +
						'" data-toggle="show-in-modal" data-page-header="' + cookie_warning_settings.anchorText +
						'">' + cookie_warning_settings.anchorText + '</a>';
				}
				// html for the message
				$cookie_message_element = jQuery(SC.macros.message(cookie_message, 'cookie-banner no-margin-bottom', cookie_warning_settings.closable));

				Layout.on('afterRender', function ()
				{
					// We prepend the html to the view
					Layout.$('[data-type=message-placeholder]').prepend($cookie_message_element);
					
					$cookie_message_element.on('close', function ()
					{
						if (cookie_warning_settings.saveInCookie)
						{
							jQuery.cookie('isCookieWarningClosed', true);
						}
					});
				});
			}
		}
	};
});