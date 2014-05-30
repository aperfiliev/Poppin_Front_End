// LanguageSupport.js
// -------------------
// Handles the change event of the language selector combo
define('LanguageSupport', function () 
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			// Adds the event listener
			_.extend(application.getLayout().events, {'change select[data-toggle="lenguage-selector"]' : 'setLanguage'});
			
			// Adds the handler function
			_.extend(application.getLayout(),
			{
				setLanguage: function (e)
				{
					var language_code = jQuery(e.target).val()
					,	url = ''
					,	selected_language = _.find(SC.ENVIRONMENT.availableLanguages, function (language)
						{
							return language.locale === language_code;
						});
					
					if (selected_language && selected_language.host)
					{
						if (Backbone.history._hasPushState)
						{
							// Seo Engine is on, send him to the root
							url = selected_language.host;
						}
						else 
						{
							// send it to the current path, it's probably a test site
							url = selected_language.host + location.pathname;
						}
					}
					else
					{
						// Worst case scenario there is no hosts properly configured
						// then we use the param **"lang"** to pass this to the ssp environment
						var current_search = SC.Utils.parseUrlOptions(window.location.search);
					
						current_search.lang = selected_language.locale;

						window.location.search =  _.reduce(current_search, function (memo, val, name)
						{
							return val ? memo + name + '=' + val + '&' : memo;
						}, '?');
						
						return window.location.search;
					}

					window.location.href = location.protocol + '//' + url;
				}
			});
		}
	};
});