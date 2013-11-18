// CreditCard.Model.js
// -----------------------
// Model for handling credit cards (CRUD)
define('CreditCard.Model', function ()
{
	'use strict';

	// validate that the expiration date is bigger than today
	function validateExpirationDate (value, name, data)
	{
		var current = new Date();

		if (new Date(current.getFullYear(), current.getMonth()).getTime() > new Date(data.expyear, data.expmonth - 1).getTime())
		{
			return _('Please select a date in the future').translate();
		}
	}
	
	return Backbone.Model.extend({

		urlRoot: 'services/creditcard.ss',

		validation: {
			ccname: [
				{ 
					required: true
				,	msg: _('Name is required').translate()
				}
			,	{
					fn: function (cc_name)
					{	
						if (cc_name && cc_name.length > 26)
						{
							return _('Name too long').translate();
						}
					}
				}
			]
		,	ccnumber: [
				{
					required: true
				,	msg: _('Card Number is required').translate()
				}
			,	{
					// credit card number validation
					// It validates that the number pass the Luhn test and also that it has the right starting digits that identify the card issuer
					fn: function (cc_number, attr, form)
					{
						// this check shouldn't be necessary, maybe it needs to be removed
						if (_.isUndefined(form.internalid) && (_.isUndefined(this.attributes.ccnumber) || cc_number === this.attributes.ccnumber))
						{
							cc_number = cc_number.replace(/\s/g, '');

							//check Luhn Algorithm
							var	verify_luhn_algorithm = _(cc_number.split('').reverse()).reduce(function (a, n, index)
								{
									return a + _((+n * [1, 2][index % 2]).toString().split('')).reduce(function (b, o)
										{ return b + (+o); }, 0);
								}, 0) % 10 === 0

							// get the credit card name 
							,	paymenthod_id = _.paymenthodIdCreditCart(cc_number);

							//check that card type is supported by validation
							if (!paymenthod_id)
							{
								return _('Credit Card type is not supported').translate();	
							}
							
							else if (!verify_luhn_algorithm)
							{
								// we throw an error if the number fails the regex or the Luhn algorithm 
								return _('Credit Card Number is invalid').translate();
							}

						}
					}
				}
			]
		,	expyear: { fn: validateExpirationDate }
		,	expmonth: { fn: validateExpirationDate }
		}

	,	initialize: function (attributes, options)
		{
			this.options = options;
		}
	});
});
