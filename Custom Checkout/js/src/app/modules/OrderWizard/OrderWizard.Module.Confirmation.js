// OrderWizard.Module.Confirmation.js
// --------------------------------
// 
define('OrderWizard.Module.Confirmation', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({
		
		template: 'order_wizard_confirmation_module'
	
	,	render: function()
		{
			
			var confirmation = this.model.get('confirmation')
				// store current order id in the hash so it is available even when the checkout proccess ends. 
			,	newHash = SC.Utils.addParamsToUrl(Backbone.history.fragment, {
					last_order_id: confirmation.internalid
				});

			this.confirmationNumber = confirmation.confirmationnumber;

			Backbone.history.navigate(newHash, {
				trigger: false
			});
			
			this._render();
		}
	});
});