// OrderWizzard.View.js
// --------------------
//
define('OrderWizard.View', ['Wizard.View', 'OrderWizard.Module.TermsAndConditions','ErrorManagement'], 
		function (WizardView, TermsAndConditions, ErrorManagement, OrderPaymentmethodModel)
{
	'use strict';

	return WizardView.extend({
		
		template: 'order_wizard_layout'
	,	title: _('Checkout').translate()

	,	attributes: {
			'id': 'order-wizard-layout'
		,	'class': 'order-wizard-layout'
		}

	,	events: {
			'submit form[data-action="apply-promocode"]': 'applyPromocode'
		,	'click [data-action="remove-promocode"]': 'removePromocode'
		,	'shown #promo-code-container' : 'onShownPromocodeForm' 
		,	'click [data-action="submit-step"]' : 'submitStep' //only for Order Place button in the Order Summary
		,	'click [data-toggle="show-terms-summary"]' : 'showTerms' //only for "Show terms and cond" in the Order Summary
		,	'click [data-action="remove-item"]': 'removeItem'//minicart remove item
		,	'submit [data-action="update-quantity"]': 'updateItemQuantity'//minicart update item quantity
		,	'blur [name="quantity"]': 'updateItemQuantity'//minicart update quantity
		,	'submit form[data-action="apply-giftcert"]': 'applyGiftCertificate'
		,	'click [data-action="remove-giftcert"]': 'removeGiftCertificate'
		,	'shown #gift-certificate-form' : 'onShownGiftCertificateForm'	
		,	'click .keep-in-touch-checkbox':'optin'
		,	'click [data-action="select"]': 'selectAddress'
		,	'click [data-action="select-creditcard"]': 'selectCreditCard'
		}
	
	,	selectCreditCard: function (e)
	{	
		this.setCreditCard({
			id: jQuery(e.target).data('id')
		});
		
		// As we alreay already set the credit card, we let the step know that we are ready
		this.trigger('ready', !this.requireccsecuritycode);
		console.log(this.requireccsecuritycode);
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
	{	console.log("newCredit"); console.log(this);
		
		this.model.get("paymentmethods").models[0].set("creditcard", new OrderPaymentmethodModel({
			type: 'creditcard'
		,	creditcard: this.creditcards.get(options.id).attributes
		})
		);
		this.setSecurityNumber();

		OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

		// We re render so if there is changes to be shown they are represented in the view
		this.render();
	}
	
	,	selectAddress: function (e)
	{
		jQuery('.wizard-content .alert-error').hide(); 
		
		// Grabs the address id and sets it to the model
		// on the position in which our sub class is manageing (billaddress or shipaddress)
		this.setAddress(jQuery(e.target).data('id').toString(),e.target.getAttribute("id"));

		// re render so if there is changes to be shown they are represented in the view
		this.render();              

		// As we already set the address, we let the step know that we are ready
		this.trigger('ready', true);
	}
	,	setAddress: function (address_id, options)
	{
		this.model.set(options, address_id, options);

		this.addressId = address_id;

		return this;
	}
	,	initialize: function(options)
		{	
			if(Backbone.history.fragment.indexOf('review')>-1){
				jQuery("#sipmethod-div").append(jQuery("#shipmethod-content"));
			}
//			jQuery("#sipmethod-div").append(jQuery("#shipmethod-content"));
//			jQuery("#shipmethod-content").appendTo(jQuery("#sipmethod-div"));
//			jQuery("#sipmethod-div").load("order_wizard_shipmethod_module.txt");
//			console.log("initialize");
//			console.log(jQuery("#shipmethod-content"));
			var self = this;
			this.wizard = options.wizard;
			this.currentStep = options.currentStep;
			console.log("initialize");
//				this.wizard.options.profile.get("creditcards").destroy({ wait: true });
				console.log(this.wizard.options.profile.get("creditcards"));

			if(this.wizard.options.profile.attributes.companyname!=null){jQuery("#header-phone-number").html("(866) 926-4922");}
//			this.model.manualSelectAddress
//			console.log(this.model.attributes.addresses.models[0]);
//			_.each(this.model.attributes.addresses.models, function(address){
//				
//			});
			
			//on change model we need to refresh summary
			this.model.on('sync change:summary', function ()
			{
				// TODO: nasty hack, review: when 'change' is  triggered before sync then the models are not backbone collections but arrays. 
				if (!_.isArray(self.wizard.model.get('lines')))
				{				
					self.updateCartSummary();	
				}
			});
			this.model.on('refresh', function(){
				console.log('refreshing');
				this.render();
			});
		}

	,	render: function()
		{
			this.creditcards = this.wizard.options.profile.get('creditcards');
			
			this.giftCertificates = this.model.get('paymentmethods').where({
				type: 'giftcertificate'
			});
			WizardView.prototype.render.apply(this, arguments);
			this.updateCartSummary();
		}

	,	updateCartSummary: function()
		{
			var current_step = this.wizard.getCurrentStep()
			,	was_confirmation = this.wizard.model.previous('confirmation');
			
			var profile = this.wizard.options.profile;

			if (!current_step.hideSummary && !was_confirmation)
			{
				this.$('#order-summary').empty().html(
					SC.macros.checkoutCartSummary({
						cart: this.wizard.model
					,	application: this.options.application
					,	stepPosition: this.wizard.getStepPosition()
					,	continueButtonLabel: current_step.changedContinueButtonLabel || current_step.continueButtonLabel || _('Place Order').translate()
					,	hideItems: current_step.hideSummaryItems
					,	payPalUrl: profile.get("paypalUrl")
					,	subscription: this.wizard.options.profile.attributes.emailsubscribe
					})
					
				);
				
			}
			
			this.$('[data-toggle="tooltip"]').tooltip({html: true});
		}

		// applyPromocode:
		// Handles the submit of the apply promo code form
	,	applyPromocode: function (e)
		{
			var self = this
			,	$target = jQuery(e.target)
			,	options = $target.serializeObject();

			e.preventDefault();
			
			this.$('[data-type=promocode-error-placeholder]').empty();

			// disable navigation buttons
			this.currentStep.disableNavButtons();
			// disable inputs and buttons
			$target.find('input, button').prop('disabled', true);

			this.model.save({ promocode: { code: options.promocode.trim() } }).error(
				function (jqXhr) 
				{
					self.model.unset('promocode');
					jqXhr.preventDefault = true;
					var message = ErrorManagement.parseErrorMessage(jqXhr, self.options.application.getLayout().errorMessageKeys);
					if(message.indexOf("Coupon code is invalid or unrecognized")>-1)
						message = "Gone are the days of humdrum office products and that promo code";
					if(message.indexOf("This coupon code has expired or is invalid")>-1)
						message = "This promo code has expired or is invalid";
					//powertip error for promocode
//					powerTip.create('promocode', message, 'powerTipPromo', -49, -10);
//					$target.find('#promocode').on('focusin', function() { powerTip.hide('powerTipPromo'); });
//					$target.find('#promocode').css('border', '2px solid red').css('padding', '1px 6px');
					//end of promo powertip
					self.$('[data-type=promocode-error-placeholder]').html(SC.macros.message(message,'error',true));
					$target.find('input[name=promocode]').val('').focus();
				}
			).always(
				function(){
					// enable navigation buttons
					self.currentStep.enableNavButtons();
					// enable inputs and buttons
					$target.find('input, button').prop('disabled', false);
				}
			);
		}


		// removePromocode:
		// Handles the remove promocode button
	,	removePromocode: function (e)
		{
			var self = this;

			e.preventDefault();

			// disable navigation buttons
			this.currentStep.disableNavButtons();

			this.model.save({ promocode: null }).always(function(){
				// enable navigation buttons
				self.currentStep.enableNavButtons();
			});
		}

		// onPromocodeFormShown
		// Handles the shown of promocode form
	,	onShownPromocodeForm: function(e)
		{
			jQuery(e.target).find('input[name="promocode"]').focus();
		}
	//Gift certificate methods
	,	updateGiftCertificates: function (codes)
	{
		var self = this;

		// disable navigation buttons
		this.wizard.getCurrentStep().disableNavButtons();
		// disable inputs and buttons
		this.$('input, button').prop('disabled', true);
		
		return new Backbone.Model().save(
			{
				giftcertificates: codes
			}
		,	{
				url: _.getAbsoluteUrl('services/live-order-giftcertificate.ss')

			,	success: function (model, attributes)
				{
					self.model.set({
						paymentmethods: attributes.paymentmethods
					,	summary: attributes.summary
					,	touchpoints: attributes.touchpoints
					});
				}

			,	error: function (model, jqXhr)
				{
					jqXhr.preventDefault = true;
					//self.wizard.manageError(JSON.parse(jqXhr.responseText));
					var error =JSON.parse(jqXhr.responseText);
					if(error.errorMessage.indexOf('Error: The gift card entered has no remaining value')>-1){
						error.errorMessage = "The gift card entered has no remaining value";
					}
					if(error.errorMessage.indexOf("Gift certificate redemption amount exceeds available amount on the gift certificate")>-1){
						error.errorMessage = "You've waited to long, this gift card has expired";
					}
					self.$('[data-type=alert-placeholder-gif-certificate]').html(SC.macros.message(error.errorMessage,'error',true));
				}
			}
		).always(function(){
			// enable navigation buttons
			self.wizard.getCurrentStep().enableNavButtons();
			// enable inputs and buttons
			self.$('input, button').prop('disabled', false);
		});
		this.render;
	}

,	applyGiftCertificate: function (e)
	{
		
		e.preventDefault();
		
		var code = jQuery.trim(jQuery(e.target).find('[name="code"]').val())
		,	is_applied = _.find(this.giftCertificates, function (certificate)
			{
				return certificate.get('giftcertificate').code === code;
			});
		
		if (!code)
		{
//			this.wizard.manageError({
//				errorCode: 'ERR_WS_EMPTY_GIFTCERTIFICATE'
//			,	errorMessage: 'This gift card does not have any credit left'
//			});
			
			var error = {
					errorCode: 'ERR_WS_EMPTY_GIFTCERTIFICATE'
				,	errorMessage: 'This gift card does not have any credit left'
				};
			self.$('[data-type=giftcertificate-error-placeholder]').html(SC.macros.message(error.errorMessage,'error',true));
		}
		else if (is_applied)
		{
			console.log('is applioed');
			this.wizard.manageError({
				errorCode: 'ERR_WS_APPLIED_GIFTCERTIFICATE'
			,	errorMessage: 'Gift Certificate is applied'
			});
		}
		else
		{
			console.log(this.getGiftCertificatesCodes().concat(code));
			this.updateGiftCertificates(this.getGiftCertificatesCodes().concat(code));
		}
	}
	
,	removeGiftCertificate: function (e)
	{
//		console.log(this.giftCertificates);
		var code = jQuery(e.target).data('id')
		,	is_applied = _.find(this.giftCertificates, function (payment_method)
			{
				return payment_method.get('giftcertificate').code === code;
			});

		if (is_applied && confirm(_('Are you sure you want to remove this Gift certificate?').translate()))
		{
			this.updateGiftCertificates(_.without(this.getGiftCertificatesCodes(), code));
		}
	}

,	getGiftCertificatesCodes: function ()
	{
//		console.log("aaa");
//		console.log(this.giftCertificates);
		return _.map(this.giftCertificates, function (payment_method)
		{
			console.log(payment_method.get('giftcertificate'));
			return payment_method.get('giftcertificate').code;
		});
	}

,	showError: function ()
	{
//		this.$('.control-group').addClass('error');
//		WizardModule.prototype.showError.apply(this, arguments);
		self.showError(result.errorMessage, $line, result.errorDetails);
	}

	// onShownGiftCertificateForm
	// Handles the shown of promocode form
,	onShownGiftCertificateForm: function (e)
	{
		jQuery(e.target).find('input[name="code"]').focus();
	}
	// minicart updateItemQuantity:
	// executes on blur of the quantity input
	// Finds the item in the cart model, updates its quantity and saves the cart model
	,	updateItemQuantity: function (e)
	{
		e.preventDefault();

		var self = this
		,	$line = null
		,	options = jQuery(e.target).closest('form').serializeObject()
		,	line = this.model.get('lines').get(options.internalid);

		if (parseInt(line.get('quantity'),10) !==  parseInt(options.quantity,10))
		{
			line.set('quantity', options.quantity);

			$line = this.$('#' + options.internalid);

			this.model.updateLine(line)
				.success(_.bind(this.showContent, this))
				.error(
					function (jqXhr)
					{
						jqXhr.preventDefault = true;
						var result = JSON.parse(jqXhr.responseText);

						self.showError(result.errorMessage, $line, result.errorDetails);
					}
				);
		}
	}
	//minicart actions
	,	removeItem: function (e)
	{
		this.model.removeLine(this.model.get('lines').get(jQuery(e.target).data('internalid')))
			.success(_.bind(this.showContent, this));
	}
	,optin:function(e){
		console.log("optin");
		var self=this,
		d=jQuery(e.target);
		if(d.prop("checked")){
			self.wizard.options.profile.attributes.emailsubscribe="T";
		}
		else{
			self.wizard.options.profile.attributes.emailsubscribe="F";
		}
	}

	,	destroy: function ()
		{
			var layout = this.options.application.getLayout();
			// The step could've resetted the header, we now put it back
			if (layout.originalHeader)
			{
				layout.$('#site-header').html(layout.originalHeader);
			}

			this._destroy();
		}

	,	submitStep: function(e) { //only for Order Place button in the Order Summary
		//console.log('lalala');
		//if(this.currentStep.wizard.currentStep==='billing'){
			//console.log('lalala2');
			//this.wizard.model.submit();
			var step = this.currentStep;
			step.submit(e);
		//}
			//var step = this.currentStep;
			//step.submit(e);
		}

	,	showTerms: TermsAndConditions.prototype.showTerms //only for "Show terms and cond" in the Order Summary
	});
});
