// OrderWizard.Module.PaymentMethod.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({

		submit: function()
		{
			// Gets teh payment methos collection
			var payment_methods = this.model.get('paymentmethods');

			// Removes the primary if any
			payment_methods.remove(
				payment_methods.where({primary: true})
			);

			// Gets the payment method for this object
			var payment_method = this.paymentMethod;

			// Sets it as primary
			payment_method.set('primary', true);

			// Adds it to the collection
			payment_methods.add(payment_method);

			// We just return a resolved promise
			return jQuery.Deferred().resolve();
		}
	});
});