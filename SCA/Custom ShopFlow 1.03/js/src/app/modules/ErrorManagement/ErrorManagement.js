/* global nsglobal */
// ErrorManagement.js
// ------------------
// Handles all errors related to api calls and provides a 404 and 500 error pages
// Also it manages 401 error (session expires) and do the redirect to login
define('ErrorManagement', function ()
{
	'use strict';

	var Views = {};

	// Views.PageNotFound:
	// Will be rendered if there is a page we can not identify
	Views.PageNotFound = Backbone.View.extend({

		template: 'page_not_found'
	,	title: _('Page not found').translate()
	,	page_header: _('Page not found').translate()

	,	attributes: {
			'id': 'page-not-found'
		,	'class': 'page-not-found'
		}

	,	initialize: function ()
		{
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 404;
			}
		}
	});

	Views.ForbiddenError = Backbone.View.extend({

		template: 'forbidden_error'
	,	title: _('Forbidden Error').translate()
	,	page_header: _('NOT ALLOWED').translate()

	,	attributes: {
			'id': 'forbidden-error'
		,	'class': 'forbidden-error'
		}

	,	initialize: function ()
		{
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 403;
			}
		}
	});

	// Views.InternalError:
	// Will be rendered if there is an internal error
	// May be an api request that went bad or some other issue
	Views.InternalError = Backbone.View.extend({

		template: 'internal_error'
	,	title: _('Internal Error').translate()
	,	page_header: _('Internal Error').translate()

	,	attributes: {
			'id': 'internal-error'
		,	'class': 'internal-error'
		}

	,	initialize: function (options)
		{
			if (options.page_header)
			{
				this.page_header = options.page_header;
			}

			if (options.title)
			{
				this.title = options.title;
			}

			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 500;
			}
		}
	});

	Views.ExpiredLink = Backbone.View.extend({

		template: 'expired_link'

	,	attributes: {
			'id': 'expired_link'
		,	'class': 'expired_link'
		}

	,	initialize: function (options)
		{
			if (options.page_header)
			{
				this.page_header = options.page_header;
			}

			if (options.title)
			{
				this.title = options.title;
			}

			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 500;
			}
		}
	});

	// We extend the view to provide with a showError and hideError to all instances of it
	_.extend(Backbone.View.prototype, {

		// we empty all of the error placeholders of the view
		hideError: function ()
		{
			this.$('[data-type="alert-placeholder"]').empty();
		}

	,	showError: function (message,type)
		{
			this.hideError();
			// Finds or create the placeholder for the error message
			var placeholder = this.$('[data-type="alert-placeholder"]');
			if (!placeholder.length)
			{
				placeholder = jQuery('<div/>', {'data-type': 'alert-placeholder'});
				this.$el.prepend(placeholder);
			}

			// Renders the error message and into the placeholder
			placeholder.append(
				SC.macros.message(message, type ? type : 'error', true)
			);

			// Re Enables all posible disableded buttons of the view
			this.$(':disabled').attr('disabled', false);
		}
	});

	var parseErrorMessage = function (jqXhr, messageKeys)
	{
		var message = null, i, current_key;
		try
		{
			// Tries to parse the responseText and try to read the most common keys for error messages
			var response = JSON.parse(jqXhr.responseText);
			if (response)
			{
				for (i=0; i < messageKeys.length; i++)
				{
					current_key = messageKeys[i];
					if (response[current_key])
					{
						message = _.isArray(response[current_key]) ? response[current_key][0] : response[current_key];
						break;
					}
				}
			}
		}
		catch (err) {}

		return message;
	};

	return {
		Views: Views
	,	parseErrorMessage: parseErrorMessage
	,	mountToApp: function (application)
		{
			var Layout = application.getLayout();

			_.extend(Layout, {

				// layout.errorMessageKeys:
				// They will be use to try to get the error message of a faild ajax call
				// Extend this as needed
				errorMessageKeys: ['errorMessage', 'errors', 'error', 'message']

				// layout.notFound:
				// Shortcut to display the Views.PageNotFound
			,	notFound: function ()
				{
					var view = new Views.PageNotFound({
						application: application
					});

					view.showContent();
				}

				// layout.notFound:
				// Shortcut to display the Views.InternalError
				// TODO: this parameters should be an obj
			,	internalError: function (message, page_header, title)
				{
					var view = new Views.InternalError({
						application: application
					,	message: message
					,	page_header: page_header
					,	title: title
					});

					view.showContent();
				}

			,	expiredLink: function (message)
				{
					var view = new Views.ExpiredLink({
						application: application
					,	page_header: message
					,	title: message
					});

					view.showContent();
				}

			,	forbiddenError: function ()
				{
					var view = new Views.ForbiddenError({
						application: application
					});
					view.showContent();
				}
			});

			jQuery(document).ajaxError(function (e, jqXhr, options, error_text)
			{
				var intStatus = parseInt(jqXhr.status, 10);

				if (error_text === 'abort' || intStatus === 0)
				{
					return;
				}

				// Unauthorized Error, customer must be logged in - we pass origin parameter with the right touchpoint for redirect the user after login
				if (intStatus === 401)
				{
					var url = application.getConfig('siteSettings.touchpoints.login');
					if (application.getConfig('currentTouchpoint'))
					{
						url += '&origin=' + application.getConfig('currentTouchpoint'); //TODO: support ?origin=x
					}

					if (!!url)
					{
						window.location = url;
					}
					else
					{
						var message1 = _('You have been logged out.').translate()
						,	message2 = _('Click here to login').translate()
						,	msg = message1 + ' <a href="#login">' + message2 + '</a>';
						
						SC.ENVIRONMENT.loggedIn = false;

						if (Layout.modalCurrentView)
						{
							Layout.modalCurrentView.showError(msg);
						}
						else
						{
							Layout.currentView.showError(msg);
						}

						jqXhr.preventDefault = true;
					}
				}

				// You can bypass all this logic by capturing the error callback on the fetch using preventDefault = true on your jqXhr object
				if (!jqXhr.preventDefault)
				{
					// if its a write operation we will call the showError of the currentView or of the modal if presetn
					var message = parseErrorMessage(jqXhr, Layout.errorMessageKeys);

					if (!message || _.isObject(message))
					{
						message =  _('Theres been an internal error').translate();
					}

					if (options.type === 'GET' && options.killerId)
					{
						if  (intStatus === 403)
						{
							// Not Found error, we show that error
							Layout.forbiddenError();
						}
						// Its a read operation that was ment to show a page
						else if  (intStatus === 404)
						{
							// Not Found error, we show that error
							Layout.notFound();
						}
						else
						{
							// Other ways we just show an internal error page
							Layout.internalError(message);
						}
					}
					else if (Layout.currentView)
					{
						//Do not show error message if forbidden
						if (intStatus !== 403)
						{
							// Calls the showError of the modal if present or the one of the currentView (content view)
							if (Layout.modalCurrentView)
							{
								Layout.modalCurrentView.showError(message);
							}
							else
							{
								Layout.currentView.showError(message);
							}
						}
						else
						{
							var view = Layout.modalCurrentView || Layout.currentView;
							if (view && _.isFunction(view.forbiddenError))
							{
								view.forbiddenError();
							}
							else
							{
								Layout.forbiddenError();
							}
						}
					}
					else
					{
						// We allways default to showing the internalError of the layout
						Layout.internalError();
					}
				}
			});
		}
	};
});