// OrderWizard.Module.RegisterEmail.js
// --------------------------------
// 
define('OrderWizard.Module.RegisterEmail', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({
		
		template: 'order_wizard_registeremail_module'

	,	invalidEmailErrorMessage: {errorCode:'ERR_CHK_INVALID_EMAIL', errorMessage:_('Invalid email address').translate()}
	
	,	errors: ['ERR_CHK_INVALID_EMAIL']

	,	render: function ()
		{
			var profile = this.profile = this.wizard.options.profile;

			// if the user is logged we dont render the module
			if (profile.get('isGuest') !== 'T')
			{
				this.trigger('ready', true);
			}
			else
			{
				this._render();

				if (profile.get('email') && this.wizard.isPaypalComplete())
				{
					this.trigger('ready', true);
				}
			}
		}

	,	submit: function ()
		{
			var profile = this.profile
			,	fake_promise = jQuery.Deferred()
			,	self = this
			,	email = this.$('input[name=email]').val()
			,	emailsubscribe = this.$('input[name=sign-up-newsletter]').is(':checked') ? 'T' : 'F';
			
			// if the user is not guest or not change the current values we just resolve the promise
			if (profile.get('isGuest') !== 'T' || (profile.get('email') === email && profile.get('emailsubscribe') === emailsubscribe))
			{
				return this.isValid();
			}
			
			profile.set({
				email: email
			,	confirm_email: email
			});

			this.isValid().then(function ()
			{
				// TODO: do we need to subscribe the guest to a campaign???
				profile
					.set('emailsubscribe', emailsubscribe)
					.save()
					.then(function ()
					{
						self.render();
						fake_promise.resolve();
					}, function (message)
					{
						fake_promise.reject(message);
					});
			}, function (message)
			{
				fake_promise.reject(message);
			});

			return fake_promise;
		}

	,	isValid: function() 
		{
			var promise = jQuery.Deferred()
			,	profile = this.wizard.options.profile;

			if (profile.get('isGuest') !== 'T' || Backbone.Validation.patterns.email.test(profile.get('email')))
			{
				return promise.resolve();
			}

			return promise.reject(this.invalidEmailErrorMessage);
		}

	,	showError: function ()
		{
			this.$('.control-group').removeClass('error');
			this.$('.control-group').addClass('error');
			WizardModule.prototype.showError.apply(this, arguments);
		}	

	});
});