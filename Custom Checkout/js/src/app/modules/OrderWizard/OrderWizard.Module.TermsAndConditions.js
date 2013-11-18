// OrderWizard.Module.TermsAndConditions.js
// --------------------------------
// 
define('OrderWizard.Module.TermsAndConditions', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({
		
		template: 'order_wizard_termsandconditions_module'

	,	events: {
			'click [data-toggle="show-terms"]': 'showTerms'
		}
	
	,	errors: ['ERR_CHK_ACCEPT_TERMS']

	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.step = options.step;
			this.model = options.wizard.model;
			this.options = _.extend({
				show_checkbox: false
			}, this.options || {});
		}

	,	render: function ()
		{
			// the module is rendered only if the site requires agreement to the terms and conditions
			if (SC.ENVIRONMENT.siteSettings.checkout.requiretermsandconditions === 'T')
			{
				this._render();
				var is_ready = SC.ENVIRONMENT.siteSettings.checkout.requiretermsandconditions !== 'T' || !this.options.show_checkbox || this.$('input[name=termsandconditions]').is(':checked');
				this.trigger('ready', is_ready);
			}
			else
			{
				this.trigger('ready', true);
			}
		}
		
	,	submit: function ()
		{
			var value = SC.ENVIRONMENT.siteSettings.checkout.requiretermsandconditions !== 'T' || !this.options.show_checkbox || this.$('input[name=termsandconditions]').is(':checked');
			this.model.set('agreetermcondition', value);

			return this.isValid();
		}
	
	,	showTerms: function ()
		{
			var TermsView = Backbone.View.extend({
				title: _('Terms and Conditions').translate()	
			,	render: function ()
				{
					this.$el.html(SC.ENVIRONMENT.siteSettings.checkout.termsandconditionshtml);
					return this;
				}
			});

			this.wizard.application.getLayout().showInModal(new TermsView());
		}

	,	isValid: function() 
		{
			var promise = jQuery.Deferred()
			,	value = SC.ENVIRONMENT.siteSettings.checkout.requiretermsandconditions !== 'T' || !this.options.show_checkbox || this.model.get('agreetermcondition');

			if (!value)
			{
				return promise.reject({errorCode: 'ERR_CHK_ACCEPT_TERMS', errorMessage:_('You must accept the Terms and Conditions').translate()});
			}
			else
			{
				return promise.resolve();
			}
		}
	});
});