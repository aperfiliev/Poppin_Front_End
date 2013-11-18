// OrderWizard.Module.ShowShipments.js
// --------------------------------
// 
define('OrderWizard.Module.ShowShipments', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({
		
		template: 'order_wizard_showshipments_module'
	
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

	,	changeDeliveryOptions: function(e) 
		{
			var value = this.$(e.target).val()
			,	self = this;

			this.model.set('shipmethod', value);
			this.step.disableNavButtons();
			this.model.save().always(function()
			{
				self.render();
				self.step.enableNavButtons();
			});
		}
	});
});