// Wizard.Step.js
// --------------
// Step View, Renders all the components of the Step
define('PaymentWizard.Step', ['Wizard.Step'], function (WizardStep)
{
	'use strict';

	return WizardStep.extend({

		template: 'payment_wizard_step'
	,	headerMacro: 'simplifiedHeader'
	,	footerMacro: 'footer' // simplifiedFooter for empty footer

	,	render: function ()
		{
			var layout = this.wizard.application.getLayout();

			// We store a copy of the current state of the head when it starts, to then restore it once the WizardView is destroyed
			if (!layout.originalHeader)
			{
				layout.originalHeader = layout.$('header.site-header').html();
			}

			// Every step can show its own version of header,
			layout.$('#site-header').html(SC.macros[this.headerMacro](layout));
			layout.$('#site-footer').html(SC.macros[this.footerMacro](layout));

			WizardStep.prototype.render.apply(this, arguments);

			// Notify the layout that we have modified the DOM (specially we want it to update the reference layout.$search).			
			layout.updateUI();

			// Also trigger the afterRender event so the site search module can load the typeahead. 
			layout.trigger('afterRender');
		}
	});
});