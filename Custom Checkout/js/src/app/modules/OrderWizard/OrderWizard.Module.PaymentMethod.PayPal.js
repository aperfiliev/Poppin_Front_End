// OrderWizard.Module.PaymentMethod.Creditcard.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.PayPal', ['OrderWizard.Module.PaymentMethod', 'OrderPaymentmethod.Model'], function (OrderWizardModulePaymentMethod, OrderPaymentmethodModel)
{
	'use strict';

	return OrderWizardModulePaymentMethod.extend({
		
		template: 'order_wizard_paymentmethod_paypal_module'

	,	isActive: function()
		{
			var paypal = _.findWhere(this.wizard.application.getConfig('siteSettings.paymentmethods', []), {ispaypal: 'T'});
			return (paypal && paypal.internalid);
		}

	,	past: function()
		{
			if (this.isActive() && !this.wizard.isPaypalComplete() && !this.wizard.hidePayment())
			{

				var checkout_url = this.wizard.application.getConfig('siteSettings.touchpoints.checkout')
				,	joint = ~checkout_url.indexOf('?') ? '&' : '?'
				,	previous_step_url = this.wizard.getPreviousStepUrl();
				
				checkout_url += joint + 'paypal=T&next_step=' + previous_step_url;

				Backbone.history.navigate(previous_step_url, {trigger: false, replace: true});
				
				document.location.href = checkout_url;

				throw new Error('This is not an error. This is just to abort javascript');
			}
		}

	,	render: function()
		{
			if (this.isActive())
			{
				this.paymentMethod = new OrderPaymentmethodModel({ type: 'paypal' });

				this._render();

				if (this.wizard.isPaypalComplete())
				{
					this.paymentMethod.set('primary', null);
					this.paymentMethod.set('complete',true);
					var is_ready = this.options && this.options.backFromPaypalBehavior !== 'stay';
					this.trigger('ready', is_ready);
				}
				
			}
		}

	});
});