// OrderWizard.Module.PaymentMethod.Creditcard.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.Invoice', ['OrderWizard.Module.PaymentMethod', 'OrderPaymentmethod.Model'], function (OrderWizardModulePaymentMethod, OrderPaymentmethodModel)
{
	'use strict';

	return OrderWizardModulePaymentMethod.extend({
		
		template: 'order_wizard_paymentmethod_invoice_module'

	,	events: {
			'click [data-toggle="show-terms"]': 'showTerms'
		}
	
	,	errors: ['ERR_CHK_INVOICE_CREDIT_LIMIT']

	,	showTerms: function()
		{
			var self = this; 
			var TermsView = Backbone.View.extend({
				title: _('Terms and Conditions').translate()	
			,	render: function ()
				{
					this.$el.html(self.wizard.application.getConfig('invoiceTermsAndConditions'));
					return this;
				}
			});
			this.wizard.application.getLayout().showInModal(new TermsView());
		}

	,	isActive: function ()
		{
			var terms = this.terms = this.getProfile().get('paymentterms');
			return terms && terms.internalid;
		}

	,	getProfile: function ()
		{
			return this.wizard.options.profile;
		}

	,	render: function ()
		{
			if (this.isActive())
			{
				return this._render();
			}
		}

	,	submit: function ()
		{
			var self = this;

			return this.isValid().done(function ()
			{
				self.paymentMethod = new OrderPaymentmethodModel(
				{ 
						type: 'invoice'
					,	terms: self.wizard.options.profile.get('paymentterms')
					,	purchasenumber: self.$('[name=purchase-order-number]').val() || ''
				});

				OrderWizardModulePaymentMethod.prototype.submit.apply(self);
			});
		}
	});
});