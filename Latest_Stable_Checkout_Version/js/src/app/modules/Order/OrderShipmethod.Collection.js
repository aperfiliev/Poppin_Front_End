// OrderShipmethod.Collection.js
// -----------------------------
// Shipping methods collection
define('OrderShipmethod.Collection', ['OrderShipmethod.Model'], function (Model) {

	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});