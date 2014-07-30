// LiveOrder.Collection.js
// -----------------------
// Live Orders collection
define('LiveOrder.Collection', ['LiveOrder.Model'], function (Model) {

	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});