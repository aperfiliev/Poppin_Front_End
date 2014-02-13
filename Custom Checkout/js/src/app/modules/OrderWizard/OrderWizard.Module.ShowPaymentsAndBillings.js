// OrderWizard.Module.ShowPayments.js
// --------------------------------
// 
define('OrderWizard.Module.ShowPaymentsAndBillings', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend(
	{
		
			template: 'order_wizard_showpaymentsandbillings_module'
		
		,	events: {
				'click input[name="delivery-options"]': 'changeDeliveryOptions'
			}
		, shouldBeRendered : function ()
		{
			var profile     = this.wizard.options.profile,
			creditcards = profile.get('creditcards'),
			//creditcards = this.getPaymentmethods(),
			addresses   = profile.get('addresses');
			return addresses.length && creditcards.length;
		}
		
		, getAddresses : function () 
		{
			var profile     = this.wizard.options.profile;
			return profile.get('addresses').models;
		}

		,	render: function()
			{
			    console.log("showPaymantAndBillings");
				this.application = this.wizard.application;
				this.profile = this.wizard.options.profile;
				this.options.application = this.wizard.application;
				this.eventHandlersOn();
				console.log(this.model);
				
				this._render();

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
		,	submit: function()
			{
				var credit_card_pm = this.model.get('paymentmethods').where({type: 'creditcard'});
				console.log(credit_card_pm);
				
				credit_card_pm[0].attributes.creditcard.ccsecuritycode =  this.$('#ccsecuritycode').val();
			}
	});
});