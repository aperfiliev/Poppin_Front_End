// OrderWizard.Module.Confirmation.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.GiftCertificates', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({

		template: 'order_wizard_paymentmethod_giftcertificates_module'
		
	,	events: {
			'submit form': 'applyGiftCertificate'
		,	'click [data-action="remove"]': 'removeGiftCertificate'
		,	'shown #gift-certificate-form' : 'onShownGiftCertificateForm' 
		}

	,	errors: ['ERR_WS_INVALID_GIFTCERTIFICATE', 'ERR_WS_APPLIED_GIFTCERTIFICATE', 'ERR_WS_EMPTY_GIFTCERTIFICATE']

	,	render: function()
		{
			this.giftCertificates = this.model.get('paymentmethods').where({
				type: 'giftcertificate'
			});

			this.trigger('ready', true);

			this._render();
		}

	,	eventHandlersOff: function ()
		{
			this.model.off('change:paymentmethods', this.render, this);
		}

	,	past: function ()
		{
			this.eventHandlersOff();
		}
	
	,	present: function ()
		{
			this.eventHandlersOff();
			this.model.on('change:paymentmethods', this.render, this);
		}

	,	future: function ()
		{
			this.eventHandlersOff();
		}

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
						self.wizard.manageError(JSON.parse(jqXhr.responseText));
					}
				}
			).always(function(){
				// enable navigation buttons
				self.wizard.getCurrentStep().enableNavButtons();
				// enable inputs and buttons
				self.$('input, button').prop('disabled', false);
			});
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
				this.wizard.manageError({
					errorCode: 'ERR_WS_EMPTY_GIFTCERTIFICATE'
				,	errorMessage: 'This gift card does not have any credit left'
				});
			}
			else if (is_applied)
			{
				this.wizard.manageError({
					errorCode: 'ERR_WS_APPLIED_GIFTCERTIFICATE'
				,	errorMessage: 'Gift Certificate is applied'
				});
			}
			else
			{
				this.updateGiftCertificates(this.getGiftCertificatesCodes().concat(code));
			}
		}
		
	,	removeGiftCertificate: function (e)
		{
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
			return _.map(this.giftCertificates, function (payment_method)
			{
				return payment_method.get('giftcertificate').code;
			});
		}

	,	showError: function ()
		{
			this.$('.control-group').addClass('error');
			WizardModule.prototype.showError.apply(this, arguments);
		}

		// onShownGiftCertificateForm
		// Handles the shown of promocode form
	,	onShownGiftCertificateForm: function (e)
		{
			jQuery(e.target).find('input[name="code"]').focus();
		}
	});
});