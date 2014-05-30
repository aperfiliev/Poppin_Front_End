// CreditCard.Collection.js
// -----------------------
// Credit cards collection
define('CreditCard.Collection', ['CreditCard.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({

		model: Model
	,	url: 'services/creditcard.ss'
	
	});
});
