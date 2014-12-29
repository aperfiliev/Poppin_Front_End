// OrderWizard.Module.PaymentMethod.Selector.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.Selector', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({

		template: 'order_wizard_paymentmethod_selector_module'

	,	selectedPaymentErrorMessage: {errorCode: 'ERR_CHK_SELECT_PAYMENT', errorMessage: _('Please select a payment option').translate()}

	,	errors: ['ERR_CHK_SELECT_PAYMENT', 'ERR_WS_SET_PAYMENT', 'ERR_WS_INVALID_PAYMENT']

	,	events: {
			'shown a[data-toggle="tab"]': 'selectPaymentMethod'
		}

	,	initialize: function(options)
		{
			var self = this;
			WizardModule.prototype.initialize.apply(this, arguments);

			this.modules = options.modules || [
				{
					classModule: 'OrderWizard.Module.PaymentMethod.Creditcard'
				//,	name: _('Credit / Debit Card').translate()
				,	type: 'creditcard'
				,	options: {}
				}
			,	{
					classModule: 'OrderWizard.Module.PaymentMethod.Invoice'
				,	name: _('Invoice').translate()
				,	type: 'invoice'
				,	options: {}
				}
			,	{
					classModule: 'OrderWizard.Module.PaymentMethod.PayPal'
				,	name: _('PayPal').translate()
				,	type: 'paypal'
				,	options: {}

				}
			];

			_.each(this.modules, function(module)
			{
				var ModuleClass = require(module.classModule);

				module.instance = new ModuleClass(_.extend({
					wizard: self.wizard
				,	step: self.step
				,	stepGroup: self.stepGroup
				}, module.options));

				module.instance.on('ready', function(is_ready)
				{	
					self.moduleReady(is_ready);
				});
			});


			
			// this.setModuleByType()
		}
	,	moduleReady: function(is_ready)
		{
			this.trigger('ready', is_ready);
		}

	,	past: function()
		{
			var primary_paymentmethod = this.model.get('paymentmethods').findWhere({primary: true});
			if (!primary_paymentmethod) {
				this.selectedModule = null;
			}
			if (!this.selectedModule)
			{
				this.setModuleByType(primary_paymentmethod && primary_paymentmethod.get('type'));
			}
			
			this.selectedModule && this.selectedModule.instance.past && this.selectedModule.instance.past();
			this.model.off('change', this.totalChange, this);
		}

	,	present: function()
		{
			this.selectedModule && this.selectedModule.present && this.selectedModule.present();

			
			this.model.off('change', this.totalChange, this);
			this.model.on('change', this.totalChange, this);
		}

	,	future: function()
		{
			this.selectedModule && this.selectedModule.future && this.selectedModule.future();
			this.model.off('change', this.totalChange, this);
		}

	,	totalChange: function()
		{
			var was = this.model.previous('summary').total
			,	is = this.model.get('summary').total;

			// Changed from or to 0
			if ((was === 0 && is !== 0) || (was !== 0 && is === 0))
			{
				this.render();
			}
		}

	,	setModuleByType: function(type)
		{
			this.selectedModule = _.findWhere(this.modules, {type: type});
			
			if (!this.selectedModule)
			{	
				this.selectedModule = _.first(this.modules);
			}

			// set continue button label.
			if (this.selectedModule.type === 'paypal' && !this.model.get('isPaypalComplete'))
			{
				this.trigger('change_label_continue', _('Continue to Paypal').translate());
			}
			else
			{
				this.trigger('change_label_continue');
			}

		}
	
	,	render: function()
		{
			if (this.wizard.hidePayment())
			{
				this.$el.empty();
				this.trigger('change_label_continue');
				return;
			}
			var selected_payment = this.model.get('paymentmethods').findWhere({primary: true}),
				moduleType = selected_payment && selected_payment.get('type');
			console.log("selected_payment = " + selected_payment);
			console.log("paymentmethods = " + this.model.get('paymentmethods'));
			if (!this.selectedModule || this.selectedModule.type != moduleType)
			{
				this.setModuleByType(moduleType);
			} else
			{
				this.trigger('change_label_continue');
			}
			
			// We do this here so we give time for information to be bootstrapped
			_.each(this.modules, function(module)
			{
				module.isActive = module.instance.isActive();
			});

			this._render();

			var self = this;
			_.each(this.modules, function(module)
			{
				if (module.isActive)
				{
					module.instance.isReady = false;
					module.instance.render();
					self.$('#payment-method-selector-' + module.type).empty().append(module.instance.$el);
				}
			});
		}

	,	selectPaymentMethod: function(e)
		{
			this.setModuleByType(jQuery(e.target).data('type'));
		}

	,	submit: function()
		{
			// This order is bing payed with some other method (Gift Cert probably)
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}

			if (this.selectedModule && this.selectedModule.instance)
			{
				return this.selectedModule.instance.submit();
			}
			else
			{
				return jQuery.Deferred().reject(this.selectedPaymentErrorMessage);	
			}
		}

	,	isValid: function()
		{
			// This order is bing payed with some other method (Gift Cert probably)
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}

			if (this.selectedModule && this.selectedModule.instance)
			{
				return this.selectedModule.instance.isValid();
			}
			else
			{
				return jQuery.Deferred().reject(this.selectedPaymentErrorMessage);	
			}
		}
	});
});