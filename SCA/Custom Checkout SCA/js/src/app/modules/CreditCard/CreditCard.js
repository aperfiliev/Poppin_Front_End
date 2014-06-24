// CreditCard.js
// -----------------
// Defines the CreditCard  module (Model, Collection, Views, Router)
define('CreditCard', ['CreditCard.Views','CreditCard.Model','CreditCard.Collection', 'CreditCard.Router'], function (Views, Model, Collection, Router)
{
	'use strict';

	return	{
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection

	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});
