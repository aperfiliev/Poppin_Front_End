// OrderPaymentmethod.Collection.js
// --------------------------------
// Collection of posible payment method
define('OrderPaymentmethod.Collection', ['OrderPaymentmethod.Model'], function (Model) {

	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});
