// OrderWizard.Module.PaymentAndBilling.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentAndBilling', ['Wizard.Module', 'OrderWizard.Module.PaymentMethod.Creditcard'], function (WizardModule, OrderWizardModulePaymentMethodCreditcard)
{
	'use strict';

	return WizardModule.extend(
	{
		
			template: 'order_wizard_paymentandbilling_module'
		
		,	events: {
				
			}
		,	initialize: function(options)
			{
				WizardModule.prototype.initialize.apply(this, arguments);
				this.application = this.wizard.application;
				this.profile = this.wizard.options.profile;
				this.options.application = this.wizard.application;
				
				//bse===
				var self = this;
				this.credircardmodule = {
						classModule: 'OrderWizard.Module.PaymentMethod.Creditcard'
							,	name: _('Credit / Debit Card').translate()
							,	type: 'creditcard'
							,	options: {}
				};
				var ModuleClass = require(this.credircardmodule.classModule);

				this.credircardmodule.instance = new ModuleClass(_.extend({
						wizard: self.wizard
					,	step: self.step
					,	stepGroup: self.stepGroup
					}, this.credircardmodule.options));

				this.credircardmodule.instance.on('ready', function(is_ready)
				{	
					self.moduleReady(is_ready);
				});
				//bse===	
			}
		,	moduleReady: function(is_ready)
			{
				this.trigger('ready', is_ready);
			}
		,	render: function()
			{
				this.eventHandlersOn();
				this._render();
				//bse===
				//if (this.wizard.options.profile.get('creditcards').length == 0) {
					var self = this;
					this.credircardmodule.instance.isReady = false;
					this.credircardmodule.instance.render();
					self.$('#showpaymentsandbillings-' + this.credircardmodule.type).empty().append(this.credircardmodule.instance.$el);
				//}
				//bse===
			}
		,	eventHandlersOn: function(){
				this.eventHandlersOff();
				var self = this;
				Backbone.on('refresh', function ()
						{
							self._render();
							console.log('rendered');
						}, this);
		}
		,	eventHandlersOff: function(){
				this.model && this.model.off(null, null, this);
				
		}	
		,	getPaymentmethods: function()
		{
			return _.reject(this.model.get('paymentmethods').models, function (paymentmethod)
			{
				return paymentmethod.get('type') === 'giftcertificate';
			});
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
		,	submit: function()
			{
				//var credit_card_pm = this.model.get('paymentmethods').where({type: 'creditcard'});
				
				
				//credit_card_pm[0].attributes.creditcard.ccsecuritycode =  this.$('#ccsecuritycode').val();
				//bse===
				if (this.credircardmodule && this.credircardmodule.instance)
				{
					return this.credircardmodule.instance.submit();
				}
				//bse===
			
				//this.cardMessageModule.instance.submit();
			}
		,   shouldBeRendered : function() {
			var profile = this.wizard.options.profile;
			console.log("PAM rendered" + profile.id);
			return (profile.id == 285599 || profile.id == 274261);
		}
	});
});