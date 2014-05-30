// OrderLine.Collection.js
// -----------------------
// Order Line collection
define('OrderLine.Collection', ['OrderLine.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});