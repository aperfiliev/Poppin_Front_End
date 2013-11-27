// OrderWizzard.View.js
// --------------------
//
define('OrderWizard.View', ['Wizard.View', 'OrderWizard.Module.TermsAndConditions','ErrorManagement'], function (WizardView, TermsAndConditions, ErrorManagement)
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
		}

	,	initialize: function(options)
		{
			var self = this;
			this.wizard = options.wizard;
			this.currentStep = options.currentStep;
			
			//on change model we need to refresh summary
			this.model.on('sync change:summary', function ()
			{
				// TODO: nasty hack, review: when 'change' is  triggered before sync then the models are not backbone collections but arrays. 
				if (!_.isArray(self.wizard.model.get('lines')))
				{				
					self.updateCartSummary();	
				}
			});
		}

	,	render: function()
		{
			WizardView.prototype.render.apply(this, arguments);
			this.updateCartSummary();
		}

	,	updateCartSummary: function()
		{
			var current_step = this.wizard.getCurrentStep()
			,	was_confirmation = this.wizard.model.previous('confirmation');

			if (!current_step.hideSummary && !was_confirmation)
			{
				this.$('#order-summary').empty().html(
					SC.macros.checkoutCartSummary({
						cart: this.wizard.model
					,	application: this.options.application
					,	stepPosition: this.wizard.getStepPosition()
					,	continueButtonLabel: current_step.changedContinueButtonLabel || current_step.continueButtonLabel || _('Place Order').translate()
					,	hideItems: current_step.hideSummaryItems
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

			this.model.save({ promocode: { code: options.promocode } }).error(
				function (jqXhr) 
				{
					self.model.unset('promocode');
					jqXhr.preventDefault = true;
					var message = ErrorManagement.parseErrorMessage(jqXhr, self.options.application.getLayout().errorMessageKeys);
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
		console.log('lalala');
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
