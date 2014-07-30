// OrderWizard.Module.Shipmethod.js
// --------------------------------
// 
define('OrderWizard.Module.RegisterGuest', ['Wizard.Module', 'Account.Register.Model'], function (WizardModule, AccountRegisterModel)
{
	'use strict';

	return WizardModule.extend({

		template: 'order_wizard_register_guest_module'

	,	events: {
			'submit form': 'saveForm'
		}

	,	errors: [
			'AN_ACCOUNT_WITH_THAT_NAME_AND_EMAIL_ADDRESS_ALREADY_EXISTS'
		,	'ERR_WS_CUSTOMER_REGISTRATION'
		,	'ERR_WS_INVALID_EMAIL'
		]

	,	render: function ()
		{
			var application = this.wizard.application;
			
			this.model = new AccountRegisterModel();

			if (application.getUser().get('isGuest') === 'T')
			{
				this.guestEmail = this.wizard.options.profile.get('email');				
				this._render();
			}
			else
			{
				this.trigger('ready', true);
			}
		}

	,	showSuccess: function ()
		{
			var self = this; 

			this.$('form').empty().html(
				SC.macros.message(
					_('Account successfully created').translate()
				,	'success'
				)
			);

			this.wizard.application.getCart().fetch({
				success: function ()
				{
					var layout = self.wizard.application.getLayout();
					layout.$('#site-header').html(SC.macros[self.wizard.getCurrentStep().headerMacro](layout));
					layout.$('#site-footer').html(SC.macros[self.wizard.getCurrentStep().footerMacro](layout));
				}
			}); 
		}

	,	saveForm: function (e)
		{
			e.preventDefault();

			var self = this
			,	$target = jQuery(e.target)
			,	user_data = $target.serializeObject();

			this.$savingForm = $target.closest('form');
			
			this.model.save(user_data)
				.success(function ()
				{	
					self.wizard.application.getUser().set(self.model.get('user'));
					self.showSuccess();
				})
				.error(function (jqXhr)
				{
					jqXhr.preventDefault = true;
					self.wizard.manageError(JSON.parse(jqXhr.responseText));
				});
		}
	
	,	showError: function ()
		{
			if (this.error && this.error.errorCode === 'AN_ACCOUNT_WITH_THAT_NAME_AND_EMAIL_ADDRESS_ALREADY_EXISTS')
			{
				this.error.errorMessage = this.error.errorMessage.replace('href=\'{1}\'', 'href="#" data-touchpoint="login"');
			}
			
			WizardModule.prototype.showError.apply(this, arguments);
		}
	});
});