// OrderWizard.Module.PaymentMethod.Creditcard.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.Creditcard'
,	['OrderWizard.Module.PaymentMethod', 'CreditCard.Views', 'CreditCard.Model', 'OrderPaymentmethod.Model']
,	function (OrderWizardModulePaymentMethod, CreditCardViews, CreditCardModel, OrderPaymentmethodModel)
{
	'use strict';

	return OrderWizardModulePaymentMethod.extend({
		
		template: 'order_wizard_paymentmethod_creditcard_module'

	,	securityNumberErrorMessage: {errorCode:'ERR_CHK_INCOMPLETE_SECURITY_NUMBER', errorMessage:_('Security Number is required').translate()}
	
	,	selectMessage: _('Use this Card').translate()

	,	events: {
			'click [data-action="select"]': 'selectCreditCard'
		,	'click [data-action="change-creditcard"]': 'changeCreditCard' 
		}

	,	errors: ['ERR_CHK_INCOMPLETE_CREDITCARD', 'ERR_CHK_SELECT_CREDITCARD', 'ERR_CHK_INCOMPLETE_SECURITY_NUMBER', 'ERR_WS_INVALID_PAYMENT']

	,	isActive: function ()
		{
			var a_credit_card = _.findWhere(this.wizard.application.getConfig('siteSettings.paymentmethods', []), {
				creditcard: 'T'
			});
			
			return a_credit_card && a_credit_card.internalid;
		}

	,	render: function ()
		{
			var self = this
				// currently we only support 1 credit card as payment method
			,	order_payment_method = this.model.get('paymentmethods').findWhere({
					type: 'creditcard'
				});
			
			this.creditcard = null;

			this.paymentMethod = order_payment_method || new OrderPaymentmethodModel({
				type: 'creditcard'
			});

			var	order_creditcard = this.paymentMethod.get('creditcard');

			this.requireccsecuritycode = SC.ENVIRONMENT.siteSettings.checkout.requireccsecuritycode === 'T';

			// creditcard set up
			this.creditcards = this.wizard.options.profile.get('creditcards');

			// Removes prevously added events on the address collection
			this.creditcards.off(null, null, this);
			
			this.creditcards.on('reset destroy change add', function ()
			{	
				//search for the paymentmethod in the order that is creditcard
				var order_payment_method = self.model.get('paymentmethods').findWhere({
					type: 'creditcard'
				})
				,	order_creditcard_id = order_payment_method && order_payment_method.get('creditcard') && order_payment_method.get('creditcard').internalid;
				
				//if the order has a credit card and that credit card exists on the profile we set it (making sure it is the same as in the profile)
				if (order_creditcard_id && self.creditcards.get(order_creditcard_id))
				{
					self.setCreditCard({
						id: order_creditcard_id
					});	
				}
				// if the creditcard in the order is not longer in the profile we delete it. 
				else if (order_creditcard_id) 
				{
					self.unsetCreditCard(); 
				}

				self.render();

			}, this);

			if (!this.creditcards.length)
			{

				this.creditcard = new CreditCardModel({}, {
					paymentMethdos: this.wizard.application.getConfig('siteSettings.paymentmethods')
				});

				if (this.requireccsecuritycode)
				{
					this.creditcard.validation.ccsecuritycode = {
						fn: function (cc_security_code)
						{
							if (!_.validateSecurityCode(cc_security_code))
							{
								return self.securityNumberErrorMessage.errorMessage;
							}
									
						}
					};
				}

			}
			else
			{	
				if (order_creditcard)
				{
					this.creditcard = this.creditcards.get(order_creditcard.internalid);
				}
				else if (this.wizard.options.profile.get('isGuest') === 'T')
				{
					// if the order is empty and is a guest use the first credit card in the list
					this.creditcard = this.creditcards.at(0);
					
					this.setCreditCard({
						id: this.creditcard.id
					});
				}
			}
			
			this._render();

			if (!this.creditcards.length)
			{
				this.creditcardView = new CreditCardViews.Details({
					application: this.wizard.application
				,	collection: this.creditcards
				,	model: this.creditcard
				});

				this.creditcardView.$el = this.$('#creditcard-module-form-placeholder');
				
				Backbone.Validation.bind(this.creditcardView);
				this.creditcardView.delegateEvents();
			}
			else
			{

				this.creditcardListView = new CreditCardViews.List({
					application: this.wizard.application
				,	collection: this.creditcards
				});

				this.creditcardListView.$el = this.$('#creditcard-module-list-placeholder');

				Backbone.Validation.bind(this.creditcardListView);
				this.creditcardListView.delegateEvents();
			}
			
			/* TODO: make this work in case that someone wants to put only the credit card module on a step
			if (!this.this.creditcard)
			{
				this.trigger('navbar_toggle', false);
			}
			else
			{
				this.trigger('navbar_toggle', true);
			}*/
		}

	,	changeCreditCard: function (e)
		{
		
			if (this.wizard.application.getUser().get('isGuest') !== 'T')
			{
				this.unsetCreditCard(e); 
			}
			else
			{
				var self = this;

				e.preventDefault();
				e.stopPropagation();
				
				this.creditcard.destroy({
					wait: true
				}).then(function ()
				{
					self.creditcards.reset([]);
					self.wizard.application.getUser().get('creditcards').reset([]);
				});
			}
		}
		
	,	selectCreditCard: function (e)
		{	
			this.setCreditCard({
				id: jQuery(e.target).data('id')
			});

			// As we alreay already set the credit card, we let the step know that we are ready
			this.trigger('ready', !this.requireccsecuritycode);
		}

	,	setSecurityNumber: function ()
		{
			if (this.requireccsecuritycode)
			{
				var credit_card = this.paymentMethod.get('creditcard');

				if (credit_card)
				{
					credit_card.ccsecuritycode = this.ccsecuritycode;
				}
			}
		}

	,	setCreditCard: function (options)
		{	
			this.paymentMethod = new OrderPaymentmethodModel({
				type: 'creditcard'
			,	creditcard: options.model || this.creditcards.get(options.id).attributes
			});

			this.setSecurityNumber();

			OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

			// We re render so if there is changes to be shown they are represented in the view
			this.render();
		}
		
	,	unsetCreditCard: function (e)
		{
			if(e)
			{
				e.preventDefault();
				e.stopPropagation();
			}
			this.paymentMethod = new OrderPaymentmethodModel({
				type: 'creditcard'
			});
			
			this.ccsecuritycode = null;

			OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

			// We re render so if there is changes to be shown they are represented in the view
			this.render();
		}

	,	submit: function ()
		{
			// This order is bing payed with some other method (Gift Cert probably)
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}

			var self = this;

			if (this.requireccsecuritycode)
			{
				this.isSecurityNumberInvalid = false;
				// we need to store this temporarly (frontend) in case a module in the same step
				// fails validation, making the credit card section re-rendered.
				// We don't want the user to have to type the security number multiple times
				this.ccsecuritycode = this.$('input[name="ccsecuritycode"]').val();
			}

			// if we are adding a new credit card
			if (this.creditcardView)
			{	
				var fake_event = jQuery.Event('click', {
						target: this.creditcardView.$('form').get(0)
					})
				,	result = this.creditcardView.saveForm(fake_event);
				
				if (!result)
				{
					// There were errors so we return a rejected promise
					return jQuery.Deferred().reject({
						errorCode: 'ERR_CHK_INCOMPLETE_CREDITCARD'
					,	errorMessage: _('The Credit Card is incomplete').translate()
					});

				}

				return result.then(function (model)
				{
					self.creditcardView = null;

					delete self.creditcard.validation.ccsecuritycode;
					
					self.wizard.options.profile.get('creditcards').add(model, {
						silent: true
					});

					self.setCreditCard({
						model: model
					});
				});
			}
			// if there are already credit cards
			else
			{
				this.setSecurityNumber();

				OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

				return this.isValid().fail(function (error)
				{
					if (error === self.securityNumberErrorMessage)
					{
						self.isSecurityNumberInvalid = true;
					}
					self._render();
				});
			}
		}

	,	past: function ()
		{
			delete this.ccsecuritycode;
		}

	,	future: function ()
		{
			delete this.ccsecuritycode;
		}

	,	isValid: function () 
		{

			// This order is bing payed with some other method (Gift Cert probably)
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}

				// user's credit cards
			var creditcards = this.wizard.options.profile.get('creditcards')
				// current order payment method
			,	order_payment_method = this.model.get('paymentmethods').findWhere({
					type: 'creditcard'
				})
				// current order credit card
			,	order_creditcard = order_payment_method && order_payment_method.get('creditcard');

			// Order is using a credit card
			// and there is a collection of creditcards
			// and the order's creditcard is on that collection
			if (order_creditcard && creditcards.length && creditcards.get(order_creditcard.internalid))
			{
				if (!this.requireccsecuritycode || _.validateSecurityCode(order_creditcard.ccsecuritycode))
				{
					return jQuery.Deferred().resolve();	
				}
				else
				{
					return jQuery.Deferred().reject(this.securityNumberErrorMessage);
				}
			}
			else
			{
				// if it not set, then lets reject it
				return jQuery.Deferred().reject({errorCode: 'ERR_CHK_SELECT_CREDITCARD', errorMessage: _('Please select a credit card').translate()});
			}
		}

	,	manageError: function (error)
		{
			if (error && error.errorCode !== 'ERR_CHK_INCOMPLETE_CREDITCARD')
			{	
				OrderWizardModulePaymentMethod.prototype.manageError.apply(this, arguments);
				if (error.errorCode === 'ERR_WS_INVALID_PAYMENT')
				{
					this.unsetCreditCard();
				}
			}
		}
	});
});
