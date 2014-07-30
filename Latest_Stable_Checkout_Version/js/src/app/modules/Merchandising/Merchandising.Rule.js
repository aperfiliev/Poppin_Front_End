// Merchandising.Rule
// ------------------
// Object that contains both model and collection of Merchandising Rules
// Each MerchandisingRule.Model is a Merchandising Rule record on the backend
define('Merchandising.Rule', function ()
{
	'use strict';

	var MerchandisingRule = {};	

	// Standard Backbone.Model, we call extend in case
	// we want to override some methods
	MerchandisingRule.Model = Backbone.Model.extend({});

	// Handles the merchandising rules, it is a Singleton as
	// there is only one set of the rules
	MerchandisingRule.Collection = Backbone.CachedCollection.extend({
		url: '/dls/services/merchandising.ss'
	,	model: MerchandisingRule.Model
	}, SC.Singleton);

	return MerchandisingRule;
});