// OrderPaymentmethod.Model.js
// ---------------------------
// Payment method Model
define('OrderPaymentmethod.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({
		getFormattedPaymentmethod: function ()
		{
			return this.get('type');
		}
	});
});
