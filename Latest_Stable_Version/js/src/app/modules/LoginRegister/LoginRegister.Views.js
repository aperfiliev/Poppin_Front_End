// LoginRegister.Views.js
// ----------------------
// Handles the form saving
define('LoginRegister.Views'
,	[
		'Account.Login.Model'
	,	'Account.Register.Model'
	,	'Account.ForgotPassword.Model'
	,	'Account.ResetPassword.Model'
	,	'ErrorManagement'
	]
,	function (
		AccountLoginModel
	,	AccountRegisterModel
	,	AccountForgotPasswordModel
	,	AccountResetPasswordModel
	,	ErrorManagement
	)
{
	'use strict';

	// We override the default behaviour of the save form for all views
	// to add an error handler using the ErrorManagement module
	var customSaveForm = function (e)
	{
		e.preventDefault();
		
		var	self = this
		,	promise = Backbone.View.prototype.saveForm.apply(this, arguments);

		promise && promise.error(function (jqXhr)
		{
			jqXhr.preventDefault = true;
			var message = ErrorManagement.parseErrorMessage(jqXhr, self.options.application.getLayout().errorMessageKeys);
			self.showError(message);
		});
	};

	var Views = {};

	Views.Login = Backbone.View.extend({

		template: 'login'

	,	attributes: {
			'id': 'login-view'
		,	'class': 'view login-view'
		}
		
	,	events: {
			'submit form': 'saveForm'
		}

	,	initialize: function ()
		{
			this.model = new AccountLoginModel();
			// on save we reidrect the user out of the login page
			// as we know there hasn't been an error
			this.model.on('save', _.bind(this.redirect, this));
		}

	,	saveForm: customSaveForm

	,	redirect: function ()
		{
			var url_options = _.parseUrlOptions(window.location.search)
			,	touchpoints = this.model.get('touchpoints');

			// if we know from which touchpoint the user is coming from
			if (url_options.origin && touchpoints[url_options.origin])
			{
				// we save the url to that touchpoint
				var url = touchpoints[url_options.origin];
				// if there is an specific hash
				if (url_options.origin_hash)
				{
					// we add it to the url as a fragment
					url = _.addParamsToUrl(url, {fragment: url_options.origin_hash});
				}

				window.location.href = url;
			}
			else
			{
				// otherwise we need to take it to the customer center
				window.location.href = touchpoints.customercenter;
			}
		}
	});

	Views.Register = Backbone.View.extend({

		template: 'register'

	,	attributes: {
			'id': 'register-view'
		,	'class': 'view register-view'
		}
		
	,	events: {
			'submit form': 'saveForm'
		}

	,	initialize: function ()
		{
			this.model = new AccountRegisterModel();
			// on save we reidrect the user out of the registration page
			// as we know there hasn't been an error
			this.model.on('save', _.bind(this.redirect, this));
		}

	,	saveForm: customSaveForm

	,	redirect: function ()
		{
			var url_options = _.parseUrlOptions(window.location.search)
			,	touchpoints = this.model.get('touchpoints');

			// if we know from which touchpoint the user is coming from
			if (url_options.origin && touchpoints[url_options.origin])
			{
				// we save the url to that touchpoint
				var url = touchpoints[url_options.origin];
				// if there is an specific hash
				if (url_options.origin_hash)
				{
					// we add it to the url as a fragment
					url = _.addParamsToUrl(url, {fragment: url_options.origin_hash});
				}

				window.location.href = url;
			}
			else
			{
				// otherwise we need to take it to the customer center
				window.location.href = touchpoints.customercenter || touchpoints.home;
			}
		}
	});

	Views.CheckoutAsGuest = Backbone.View.extend({

		template: 'checkout_as_guest'

	,	attributes: {
			'id': 'checkout-as-guest'
		,	'class': 'view checkout-as-guest'
		}

	,	events: {
			'submit form': 'checkoutAsGuest'
		}

	,	checkoutAsGuest: function (e)
		{
			e && e.preventDefault();

			this.$('[type="submit"]').attr('disabled', true);

			// all we do is thake the user to the checkout touchpoint
			// with the checkout_as_guest parameter
			window.location.href = _.addParamsToUrl(this.options.application.getConfig('siteSettings.touchpoints.checkout'), {
				checkout_as_guest: 'T'
			});
		}
	});

	Views.LoginRegister = Backbone.View.extend({

		template: 'login_register'

	,	title: _('Sign In | Register').translate()

	,	attributes: {
			'id': 'login-register'
		,	'class': 'view login-register'
		}

	,	events: {
			// login error message could contain link to registration page
			'click .alert-error a': 'handleErrorLink'
		}

	,	initialize: function (options)
		{
			var application = options.application;
			
			this.pageTitle = _('Sign In').translate();

			// On the LoginRegister view we initialize all of the views
			this.sub_views = {
				Login: new Views.Login({ application: application })
			,	Register: new Views.Register({ application: application })
			,	CheckoutAsGuest: new Views.CheckoutAsGuest({ application: application })
			};

			this.enableRegister = application.getConfig('siteSettings.loginrequired') === 'F' && application.getConfig('siteSettings.registration.registrationallowed') === 'T';
			this.enableCheckoutAsGuest =  this.enableRegister && application.getConfig('siteSettings.registration.registrationoptional') === 'T' && application.getCart().get('lines').length > 0;
		}

	,	handleErrorLink: function (e)
		{
			// if the link contains the register touchpoint
			if (~e.target.href.indexOf(this.options.application.getConfig('siteSettings.touchpoints.register')))
			{
				e.preventDefault();
				this.showRegistrationForm();
				this.sub_views.Login.hideError();
			}
		}

	,	showRegistrationForm: function ()
		{
			// show the form
			this.sub_views.Register.$el.closest('.collapse').addClass('in');
			// hide the conatiner of the link to show it
			this.sub_views.CheckoutAsGuest.$('.collapse.register').removeClass('in');
		}

	,	render: function()
		{
			var result = this._render()
			,	self = this;

			// on render we render all of the sub views
			_.each(this.sub_views, function (sub_view, key)
			{
				sub_view.render();
				self.$('[data-placeholder="' + key + '"]').append(sub_view.$el);
			});

			return result;
		}
	});

	Views.ForgotPassword = Backbone.View.extend({

		template: 'forgot_password'

	,	title: _('Reset Password').translate()

	,	events: {
			'submit form': 'saveForm'
		}

	,	initialize: function ()
		{
			this.model = new AccountForgotPasswordModel();
			this.model.on('save', _.bind(this.showSuccess, this));
		}

	,	showSuccess: function()
		{
			this.$('form').empty().html(
				SC.macros.message(
					_('We sent an email with instructions on how to reset your password to <b>$(0)</b>').translate(this.model.get('email'))
				,	'success'
				)
			);
		}
	});

	Views.ResetPassword = Backbone.View.extend({

		template: 'reset_password'

	,	title: _('Reset Password').translate()

	,	events: {
			'submit form': 'saveForm'
		}

	,	initialize: function ()
		{
			// TODO: refactor _.parseUrlOptions(location.search)
			this.model = new AccountResetPasswordModel();
			this.email = unescape(_.parseUrlOptions(location.search).e);
			this.model.set('params', {'e':this.email, 'dt':_.parseUrlOptions(location.search).dt, 'cb':_.parseUrlOptions(location.search).cb});
			this.model.on('save', _.bind(this.showSuccess, this));
		}

	,	showSuccess: function()
		{
			this.$('form').empty().html(
				SC.macros.message(
					_('Your password has been reset.').translate()
				,	'success'
				)
			);
		}
	});

	return Views;
});