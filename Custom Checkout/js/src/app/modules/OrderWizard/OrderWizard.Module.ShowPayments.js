// OrderWizard.Module.ShowPayments.js
// --------------------------------
// 
define('OrderWizard.Module.ShowPayments', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend(
	{
			template: 'order_wizard_showpayments_module'
		,	errors: ['ERR_WS_CC_AUTH']
		,	events: {
				'click input[name="delivery-options"]': 'changeDeliveryOptions'
			, 	'click input[name="review-delivery-options"]': 'changeChecked'
			,	'click [name="submit-shipping-method"]': 'submit_shipping_method'
		}

		,	changeChecked: function(e){
			console.log(e.target);
			var names = document.getElementsByName("review-delivery-options");
			console.log(names[0].getAttribute("checked"));
			_.each(names,function(name){
				if(name.getAttribute("checked")=="checked"){
					name.setAttribute("checked","");
				}
				e.target.setAttribute("checked","checked");
			});

		}

		, 	submit_shipping_method: function() {
//			if (!this.$('#ccsecuritycode').val() || (this.$('#ccsecuritycode').val() && !isNumeric(this.$('#ccsecuritycode').val()))) {
//				var errorMsg;
//				(this.$('#ccsecuritycode').val() && !isNumeric(this.$('#ccsecuritycode').val())) ?  errorMsg = _('Security Number is not valid').translate() : errorMsg = _('Security Number is required').translate();
//				var $group = this.$('#ccsecuritycode').parents('.control-group').addClass('error');
//				$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: 0px; left: 101%;" id="powerTipError" class="help-block backbone-validation"></div></div>');
//				$group.find('.help-block').text(errorMsg);
//				return jQuery.Deferred().reject(errorMsg);
//			}
//			var credit_card_pm = this.model.get('paymentmethods').where({type: 'creditcard'});
//			console.log(credit_card_pm);
//		
//			credit_card_pm[0].attributes.creditcard.ccsecuritycode =  this.$('#ccsecuritycode').val();
			
			var cvsError = this.validateAndSetCVC();
			if (cvsError) {
				return jQuery.Deferred().reject(cvsError);
			}
			
			var names = document.getElementsByName("review-delivery-options"),
				self  = this,	
				value;
			
			_.each(names,function(name){
				if(name.getAttribute("checked")=="checked"){
					value = name.getAttribute("value");
				}
			});

			this.model.set('shipmethod', value);
				this.step.disableNavButtons();
				this.model.save().always ( function()
				{
					self.render();
					self.step.enableNavButtons();
				});
		}
	
		,	initialize: function(options)
			{
				WizardModule.prototype.initialize.apply(this, arguments);
				this.model.set('ipAddress',ipAddress);				
			}
		,	moduleReady: function(is_ready)
			{
				this.trigger('ready', is_ready);
			}
		,	render: function()
			{
				console.log("Render Show Payments Module.");
				this.application = this.wizard.application;
				this.profile = this.wizard.options.profile;
				this.options.application = this.wizard.application;
				var cvcBeforeRender;
				if(this.getPaymentmethods().length > 0 && this.getPaymentmethods()[0].attributes.creditcard){
					if (!this.currentCardId && this.getPaymentmethods().length > 0 ) {
						this.currentCardId = this.getPaymentmethods()[0].attributes.creditcard.internalid;
					} else if (this.getPaymentmethods().length > 0 && (this.currentCardId != this.getPaymentmethods()[0].attributes.creditcard.internalid)) {
						this.currentCardId = this.getPaymentmethods()[0].attributes.creditcard.internalid;
						cvcBeforeRender = undefined;
					} else {
						if (this.$('#ccsecuritycode') && this.$('#ccsecuritycode')[0] && jQuery("#in-modal-ccsecuritycode").length==0) {
							cvcBeforeRender = this.$('#ccsecuritycode')[0].value;
						}
					}
				}				
				this._render();
				if (cvcBeforeRender && this.$('#ccsecuritycode')) {
					this.$('#ccsecuritycode')[0].value = cvcBeforeRender;
				}
			}
		,	getPaymentmethods: function()
			{
				return _.reject(this.model.get('paymentmethods').models, function (paymentmethod)
				{
					return paymentmethod.get('type') === 'giftcertificate';
				});
			}
		
		,   getPrimaryPaymentmethods: function()
		{
			
				return this.model.get('paymentmethods').where({primary: true});
			
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
			var currentBillAddress = this.model.attributes.billaddress;
			var cvsError = this.validateAndSetCVC();
			if (cvsError) {
				this.render();
				this.validateAndSetCVC();
				return jQuery.Deferred().reject(cvsError);
			}
			var value = this.$(e.target).val()
			,	self = this;

			this.model.set('shipmethod', value);
			this.step.disableNavButtons();
			this.model.save().always(function()
			{
				if (currentBillAddress && self.model.attributes.billaddress !=currentBillAddress ) {
					self.model.set('billaddress', currentBillAddress  ,'billaddress')
				}
				var primary_paymentmethod = self.model.get('paymentmethods').findWhere({primary: true});
				if (  primary_paymentmethod && primary_paymentmethod.get('type') === 'paypal') {
					primary_paymentmethod.set('complete',  true);
				}
				self.render();
				self.step.enableNavButtons();
			});
		}
		,	submit: function(e, additional_validation)
			{
				if(additional_validation!=undefined){additional_validation.resolve();}
				var cvsError = this.validateAndSetCVC();
				if (cvsError) {
					return jQuery.Deferred().reject(cvsError);
				}
			}
		
		, 	validateAndSetCVC: function () {
	if(this.model.get('paymentmethods').where({type: 'paypal'}).length>0 ){
				return null;
			}
				var val = this.$('#ccsecuritycode').val(),
					errorMsg;
				if (!val || (val && (/[^0-9]/.test(val) || val.length < 3))) {
					var errorMsg;
					(!val) ?  errorMsg = _('Security Number is required').translate() : errorMsg = _('Security Number is not valid').translate();
					var $group = this.$('#ccsecuritycode').parents('.control-group').addClass('error');
					$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: -9px; left: 101%;" id="powerTipError" class="help-block backbone-validation"></div></div>');
					$group.find('.help-block').text(errorMsg);
					return errorMsg;
				} else {
					var credit_card_pm = this.model.get('paymentmethods').where({type: 'creditcard'});
					console.log(credit_card_pm);
					credit_card_pm[0].attributes.creditcard.ccsecuritycode =  this.$('#ccsecuritycode').val();
					return null;
				}
		}
		,	showError: function ()
		{
			if (this.error && this.error.errorCode === 'ERR_WS_CC_AUTH')
			{
				this.error.errorMessage = "Unfortunately we were unable to authorize this purchase with the credit card information given. Please review and update your payment details below.";
				this.$('.wizard-showpayments-billing-payment-method').css('border','2px solid red');
			}
			
			WizardModule.prototype.showError.apply(this, arguments);
		}
	});
});