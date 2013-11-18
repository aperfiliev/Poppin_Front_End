// OrderWizard.Module.ShowPayments.js
// --------------------------------
// 
define('OrderWizard.Module.ShowPayments', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend(
	{
		
			template: 'order_wizard_showpayments_module'
		
		,	render: function()
			{
				this.application = this.wizard.application;
				this.profile = this.wizard.options.profile;
				this.options.application = this.wizard.application;
				this._render();
			}
		,	getPaymentmethods: function()
			{
				return _.reject(this.model.get('paymentmethods').models, function (paymentmethod)
				{
					return paymentmethod.get('type') === 'giftcertificate';
				});
			}
		,	getGiftCertificates: function()
			{
				return this.model.get('paymentmethods').where({type: 'giftcertificate'});
			}
		,	past: function()
			{
				this.model.off('change', this.totalChange, this);
			}
		,	present: function()
			{
				this.model.off('change', this.totalChange, this);
				this.model.on('change', this.totalChange, this);
			}

		,	future: function()
			{
				this.model.off('change', this.totalChange, this);
			}

		,	totalChange: function()
			{
				var was = this.model.previous('summary').total
				,	was_confirmation = this.model.previous('confirmation')
				,	is = this.model.get('summary').total;

				// Changed from or to 0
				if ( ((was === 0 && is !== 0) || (was !== 0 && is === 0)) && !was_confirmation )
				{
					this.render();
				}
			}
	});
});