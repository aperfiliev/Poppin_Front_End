// Address.Collection.js
// -----------------------
// Addresses collection
define('Address.Collection', ['Address.Model'], function (Model)
{
	'use strict';
	
	return Backbone.Collection.extend(
	{
		model: Model
	,	url: 'services/address.ss'

	});
});
