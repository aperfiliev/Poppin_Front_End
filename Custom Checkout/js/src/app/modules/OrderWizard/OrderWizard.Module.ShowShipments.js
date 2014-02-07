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
jQuery('#content').css('background','#e5e5e5').css('width','936px');
jQuery('#shop_by_color').show();
jQuery('#nav').css('margin','0px auto');
jQuery('#confirmation_search').show();
jQuery('#confirmation_search_button').show();
jQuery('#help_info_checkout').css('margin-top','-7px');
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