// LoginRegister.Router.js
// -----------------------
// Initializes the different views depending on the requested path
define('LoginRegister.Router', ['LoginRegister.Views'], function (Views)
{
	'use strict';

	return Backbone.Router.extend({
		
		routes: {
			'login-register': 'loginRegister'
		,	'forgot-password': 'forgotPassword'
		,	'reset-password': 'resetPassword'
		}
		
	,	initialize: function (application)
		{
			// application is a required parameter for all views
			// we save the parameter to pass it later
			this.application = application;
		}

	,	loginRegister: function ()
		{
			var view = new Views.LoginRegister({
				application: this.application
			});
			
			view.showContent();
		}

	,	forgotPassword: function ()
		{
			var view = new Views.ForgotPassword({
				application: this.application
			});
			
			view.showContent();
		}

	,	resetPassword: function ()
		{
			var view = new Views.ResetPassword({
				application: this.application
			});
			
			view.showContent();
		}
	});
});