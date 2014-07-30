// OrderWizard.Module.CardMessage.js
// --------------------------------
// 
define('OrderWizard.Module.CheckoutCart', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_checkoutcart_module'
			
			,	events: {
					'change #delivery-options': 'changeDeliveryOptions'
				}

			,	render: function ()
				{
					this.application = this.wizard.application;
					this.profile = this.wizard.options.profile;
					this.options.application = this.wizard.application;
					this._render();
				}
	});
});